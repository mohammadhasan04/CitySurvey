import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "reset-pw-anon";
    const limiter = rateLimit(`reset-pw:${ip}`, 5, 60000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    const { email, token, newPassword, confirmPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: "Email and new password are required" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isActive: true,
        emailVerified: new Date(),
      },
    });

    // Also sync password change to Supabase Auth section
    try {
      const { supabaseAdmin } = await import("@/lib/supabase");
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const authUser = authUsers?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);
      if (authUser) {
        await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
          password: newPassword,
        });
      }
    } catch (sErr) {
      console.warn("Notice syncing reset password to Supabase Auth:", sErr);
    }

    await prisma.auditLog.create({
      data: {
        action: "PASSWORD_RESET_SUCCESS",
        entity: "User",
        entityId: user.id,
        details: JSON.stringify({ email: user.email, method: "SUPABASE_EMAIL_OTP" }),
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now sign in with your new password.",
      redirect: "/login",
    });
  } catch (error) {
    console.error("Reset Password Route Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

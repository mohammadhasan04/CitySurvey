import { NextResponse } from "next/server";
import { verifyEmailOtp } from "@/lib/supabase-auth";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "verify-otp-anon";
    const limiter = rateLimit(`verify-otp:${ip}`, 10, 60000);
    if (!limiter.success) {
      return NextResponse.json(
        { success: false, error: "Too many verification attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    const { email, otp, type = "signup" } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "Email and OTP code are required" }, { status: 400 });
    }

    const verificationResult = await verifyEmailOtp(email, otp, type as "signup" | "recovery");
    if (!verificationResult.success) {
      return NextResponse.json({ success: false, error: verificationResult.error }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User account not found" }, { status: 404 });
    }

    if (type === "signup") {
      // Activate user account and mark email verified
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          isActive: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "EMAIL_VERIFIED",
          entity: "User",
          entityId: user.id,
          details: JSON.stringify({ email: user.email, method: "SUPABASE_EMAIL_OTP" }),
          userId: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Email address verified successfully! You can now sign in.",
        redirect: "/login",
      });
    }

    // For recovery, return a temporary token for password reset
    return NextResponse.json({
      success: true,
      message: "OTP verified successfully. Please set your new password.",
      redirect: `/reset-password?email=${encodeURIComponent(normalizedEmail)}&otp=${encodeURIComponent(otp)}`,
    });
  } catch (error) {
    console.error("verify-otp Route Error:", error);
    return NextResponse.json({ success: false, error: "OTP verification failed" }, { status: 500 });
  }
}

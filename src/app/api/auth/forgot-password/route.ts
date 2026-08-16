import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmailOtp } from "@/lib/supabase-auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "forgot-password-anon";
    const limiter = rateLimit(`forgot-pw:${ip}`, 5, 60000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many password reset requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        email: normalizedEmail,
        message: "If an account exists with this email address, a password reset link has been sent.",
      });
    }

    const { sendPasswordResetLink } = await import("@/lib/supabase-auth");
    await sendPasswordResetLink(normalizedEmail);

    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      message: "A password reset link has been sent to your email address. Please check your email to set a new password.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

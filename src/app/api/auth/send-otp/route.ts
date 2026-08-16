import { NextResponse } from "next/server";
import { sendEmailOtp } from "@/lib/supabase-auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "send-otp-anon";
    const limiter = rateLimit(`send-otp:${ip}`, 5, 60000);
    if (!limiter.success) {
      return NextResponse.json(
        { success: false, error: "Too many OTP requests. Please wait a minute before requesting another code." },
        { status: 429 }
      );
    }

    const { email, type = "signup" } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, error: "Valid email address is required" }, { status: 400 });
    }

    const result = await sendEmailOtp(email, type as "signup" | "recovery");
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit email verification OTP has been sent to ${email}`,
      otp: result.otp,
    });
  } catch (error) {
    console.error("send-otp Route Error:", error);
    return NextResponse.json({ success: false, error: "Failed to send verification OTP" }, { status: 500 });
  }
}

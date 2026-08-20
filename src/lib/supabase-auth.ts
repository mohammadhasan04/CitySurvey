import { supabaseAdmin } from "@/lib/supabase";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export function generate6DigitOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Sends a 6-digit Email OTP via Supabase Auth & records it in VerificationToken database table.
 */
export async function sendEmailOtp(email: string, type: "signup" | "recovery"): Promise<{ success: boolean; otp?: string; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const otpCode = generate6DigitOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity
    const identifier = `${type}:${normalizedEmail}`;

    // Upsert verification token in DB
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier,
          token: otpCode,
        },
      },
      update: {
        expires: expiresAt,
      },
      create: {
        identifier,
        token: otpCode,
        expires: expiresAt,
      },
    });

    // Also delete any existing tokens for this identifier to prevent clutter
    await prisma.verificationToken.deleteMany({
      where: {
        identifier,
        NOT: { token: otpCode },
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/api/auth/verify-link?email=${encodeURIComponent(normalizedEmail)}&token=${otpCode}`;

    // Send email via Nodemailer SMTP if configured
    const { sendMail } = await import("@/lib/email-service");
    await sendMail({
      to: normalizedEmail,
      subject: `Verify your City Survey Account`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #0284c7; text-align: center; margin-bottom: 20px;">City Survey System</h2>
          <p style="color: #334155; font-size: 16px;">Hello,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Please click the button below to verify your email address and activate your account instantly:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" target="_blank" style="background-color: #0284c7; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: bold; border-radius: 10px; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.3);">
              Verify &amp; Activate Account
            </a>
          </div>

          <div style="background-color: #f8fafc; border-radius: 10px; padding: 16px; text-align: center; margin-top: 20px;">
            <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">Alternatively, you can manually enter your 6-digit OTP code:</p>
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0f172a;">${otpCode}</span>
          </div>

          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 25px;">This verification link &amp; OTP code will expire in 15 minutes.</p>
        </div>
      `,
    });

    // Also trigger Supabase OTP Provider
    try {
      await supabaseAdmin.auth.signInWithOtp({
        email: normalizedEmail,
        options: { shouldCreateUser: true },
      });
    } catch (sErr) {
      console.warn("Notice triggering Supabase Auth signInWithOtp:", sErr);
    }

    console.log(`[SUPABASE AUTH OTP DISPATCHED] 6-Digit Code (${type}): ${otpCode} to ${normalizedEmail}`);

    return { success: true, otp: otpCode };
  } catch (error) {
    console.error("sendEmailOtp Error:", error);
    return { success: false, error: "Failed to send email verification OTP" };
  }
}

/**
 * Verifies the 6-digit Email OTP code entered by the user.
 */
export async function verifyEmailOtp(email: string, otpCode: string, type?: "signup" | "recovery" | "password_reset"): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otpCode.trim();

    // Check specific identifier or fuzzy email match
    let record = await prisma.verificationToken.findFirst({
      where: {
        token: cleanOtp,
        identifier: {
          contains: normalizedEmail,
        },
      },
    });

    if (!record) {
      return { success: false, error: "Invalid verification OTP code. Please check your email." };
    }

    if (new Date() > record.expires) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: { identifier: record.identifier, token: record.token },
        },
      });
      return { success: false, error: "Verification OTP code has expired. Please request a new code." };
    }

    // OTP Code is valid — clean up token from DB
    await prisma.verificationToken.delete({
      where: {
        identifier_token: { identifier: record.identifier, token: record.token },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("verifyEmailOtp Error:", error);
    return { success: false, error: "OTP verification failed. Please try again." };
  }
}

/**
 * Creates user in Supabase Authentication Dashboard section
 */
export async function createSupabaseAuthUser(email: string, password: string, name: string, role: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: false,
      user_metadata: { name, role },
    });
    if (error) {
      console.warn("Supabase Auth admin createUser notice:", error.message);
    }
    return data;
  } catch (err) {
    console.error("createSupabaseAuthUser Exception:", err);
  }
}

/**
 * Dispatches Email Account Activation Link via Supabase Auth & Nodemailer
 */
export async function sendVerificationLink(email: string): Promise<{ success: boolean; link?: string; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const identifier = `signup:${normalizedEmail}`;

    await prisma.verificationToken.upsert({
      where: { identifier_token: { identifier, token } },
      update: { expires: expiresAt },
      create: { identifier, token, expires: expiresAt },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let verifyUrl = `${appUrl}/api/auth/verify-link?email=${encodeURIComponent(normalizedEmail)}&token=${token}`;

    // 1. Trigger Supabase Cloud to AUTOMATICALLY send verification email
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: resendData, error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${appUrl}/api/auth/verify-link?email=${encodeURIComponent(normalizedEmail)}`,
        },
      });
      if (resendErr) {
        console.warn("Supabase Auth resend email notice:", resendErr.message);
      } else {
        console.log(`[SUPABASE AUTOMATED EMAIL DISPATCHED] Signup verification email sent automatically to ${normalizedEmail}`);
      }
    } catch (sErr) {
      console.warn("Supabase Auth resend notice:", sErr);
    }

    // 2. Generate Supabase action link
    try {
      const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email: normalizedEmail,
        password: crypto.randomBytes(12).toString("hex"),
        options: {
          redirectTo: `${appUrl}/api/auth/verify-link?email=${encodeURIComponent(normalizedEmail)}`,
        },
      });
      if (linkData?.properties?.action_link) {
        verifyUrl = linkData.properties.action_link;
      }
    } catch (sErr) {
      console.warn("Supabase Auth generateLink notice:", sErr);
    }

    // 3. Optional Nodemailer fallback
    const { sendMail } = await import("@/lib/email-service");
    await sendMail({
      to: normalizedEmail,
      subject: "Activate your City Survey Account",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #0284c7; text-align: center; margin-bottom: 20px;">City Survey System</h2>
          <p style="color: #334155; font-size: 16px;">Hello,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Thank you for creating an account! Please click the button below to verify your email address and activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" target="_blank" style="background-color: #0284c7; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: bold; border-radius: 10px; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.3);">
              Verify &amp; Activate Account
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px;">Or copy and paste this verification URL into your browser:</p>
          <p style="font-size: 12px; color: #0284c7; word-break: break-all;">${verifyUrl}</p>
        </div>
      `,
    });

    return { success: true, link: verifyUrl };
  } catch (error: any) {
    console.error("sendVerificationLink Error:", error);
    return { success: false, error: "Failed to dispatch verification email link." };
  }
}

/**
 * Dispatches Password Reset Link via Supabase Auth & Nodemailer
 */
export async function sendPasswordResetLink(email: string): Promise<{ success: boolean; link?: string; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const identifier = `recovery:${normalizedEmail}`;

    await prisma.verificationToken.upsert({
      where: { identifier_token: { identifier, token } },
      update: { expires: expiresAt },
      create: { identifier, token, expires: expiresAt },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let resetUrl = `${appUrl}/reset-password?email=${encodeURIComponent(normalizedEmail)}&token=${token}`;

    // 1. Trigger Supabase Cloud to AUTOMATICALLY send recovery email directly from Supabase
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: resetData, error: resetErr } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${appUrl}/reset-password?email=${encodeURIComponent(normalizedEmail)}`,
      });
      if (resetErr) {
        console.warn("Supabase Auth resetPasswordForEmail notice:", resetErr.message);
      } else {
        console.log(`[SUPABASE AUTOMATED EMAIL DISPATCHED] Password reset recovery email sent automatically to ${normalizedEmail}`);
      }
    } catch (sErr) {
      console.warn("Supabase Auth resetPasswordForEmail notice:", sErr);
    }

    // 2. Generate Supabase recovery action link
    try {
      const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: normalizedEmail,
        options: {
          redirectTo: `${appUrl}/reset-password?email=${encodeURIComponent(normalizedEmail)}`,
        },
      });
      if (linkData?.properties?.action_link) {
        resetUrl = linkData.properties.action_link;
      }
    } catch (sErr) {
      console.warn("Supabase Auth generateLink recovery notice:", sErr);
    }

    // 3. Optional Nodemailer fallback
    const { sendMail } = await import("@/lib/email-service");
    await sendMail({
      to: normalizedEmail,
      subject: "Reset your City Survey Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #0284c7; text-align: center; margin-bottom: 20px;">City Survey System</h2>
          <p style="color: #334155; font-size: 16px;">Hello,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">You requested to reset your password. Click the button below to set a new password for your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" target="_blank" style="background-color: #0284c7; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: bold; border-radius: 10px; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.3);">
              Reset Password Now
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px;">Or copy and paste this password reset URL into your browser:</p>
          <p style="font-size: 12px; color: #0284c7; word-break: break-all;">${resetUrl}</p>
        </div>
      `,
    });

    return { success: true, link: resetUrl };
  } catch (error: any) {
    console.error("sendPasswordResetLink Error:", error);
    return { success: false, error: "Failed to dispatch password reset email link." };
  }
}

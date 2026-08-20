import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmailOtp, createSupabaseAuthUser } from "@/lib/supabase-auth";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "register-anon";
    const limiter = rateLimit(`register:${ip}`, 5, 60000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // If no users exist in system, make the very first registered user SUPER_ADMIN
    const totalUsers = await prisma.user.count({ where: { deletedAt: null } });
    const assignedRole = totalUsers === 0 ? "SUPER_ADMIN" : "RESIDENT";

    // Create user (Active immediately, 0 email verification needed)
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: validatedData.name,
        phone: validatedData.phone || null,
        password: hashedPassword,
        role: assignedRole,
        isActive: true,
        emailVerified: new Date(),
      },
    });

    // Create account directly in Supabase Auth Dashboard section
    await createSupabaseAuthUser(normalizedEmail, validatedData.password, validatedData.name, assignedRole);

    // Trigger Supabase Auth automatic verification email dispatch
    const { sendVerificationLink } = await import("@/lib/supabase-auth");
    await sendVerificationLink(normalizedEmail);

    // Log the registration
    await prisma.auditLog.create({
      data: {
        action: "REGISTER_SUCCESS",
        entity: "User",
        entityId: user.id,
        details: JSON.stringify({ email: user.email, role: assignedRole }),
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        email: normalizedEmail,
        message: "Account created successfully! An automated verification email has been dispatched to your email address.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid registration input data" },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

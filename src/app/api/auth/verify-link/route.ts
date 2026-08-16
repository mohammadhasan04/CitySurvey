import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.redirect(
        new URL("/login?error=InvalidVerificationLink", request.url)
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?error=UserNotFound", request.url)
      );
    }

    // Activate user account & set emailVerified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        emailVerified: new Date(),
      },
    });

    // Clean up any pending verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: {
          contains: normalizedEmail,
        },
      },
    });

    return NextResponse.redirect(
      new URL(
        `/login?verified=true&email=${encodeURIComponent(normalizedEmail)}`,
        request.url
      )
    );
  } catch (error) {
    console.error("Verify link endpoint error:", error);
    return NextResponse.redirect(
      new URL("/login?error=VerificationFailed", request.url)
    );
  }
}

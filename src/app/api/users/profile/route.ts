import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

import { rateLimit } from "@/lib/rate-limit";

// GET - Get current user profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update profile details & password
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limiter = rateLimit(`profile:${session.user.id}`, 10, 60000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many profile update attempts. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, image, currentPassword, newPassword } = body;

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};

    if (name) updateData.name = name;
    if (email && email !== currentUser.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail && existingEmail.id !== currentUser.id) {
        return NextResponse.json({ error: "Email address is already in use" }, { status: 400 });
      }
      updateData.email = email;
    }
    if (phone !== undefined) updateData.phone = phone;
    if (image !== undefined) updateData.image = image;

    // Handle Password Change with Strict Complexity Check
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }

      // Strong password rules (min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char)
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!strongPasswordRegex.test(newPassword)) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character." },
          { status: 400 }
        );
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
      },
    });

    // Also sync email or password changes to Supabase Auth
    try {
      const { supabaseAdmin } = await import("@/lib/supabase");
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const authUser = authUsers?.users?.find(u => u.email?.toLowerCase() === currentUser.email.toLowerCase());
      if (authUser) {
        await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
          ...(email ? { email } : {}),
          ...(newPassword ? { password: newPassword } : {}),
          user_metadata: { name: updatedUser.name, role: updatedUser.role },
        });
      }
    } catch (sErr) {
      console.warn("Notice syncing profile update to Supabase Auth:", sErr);
    }

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "User",
        entityId: updatedUser.id,
        details: JSON.stringify({ nameUpdated: Boolean(name), passwordUpdated: Boolean(newPassword) }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB cap to prevent DB base64 bloat

// POST - Upload private profile picture
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limiter = rateLimit(`avatar:${session.user.id}`, 5, 60000);
    if (!limiter.success) {
      return NextResponse.json({ error: "Too many upload attempts. Please try again in a minute." }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file uploaded" }, { status: 400 });
    }

    // Validate MIME type against allowlist
    if (!file.type || !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed." },
        { status: 400 }
      );
    }

    // Check size limit (max 2MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image file size must be under 2MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/png";
    const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

    // Store private base64 avatar in user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: base64Data },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "UserAvatar",
        entityId: session.user.id,
        details: JSON.stringify({ action: "UPLOAD_PRIVATE_AVATAR" }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Private profile picture uploaded successfully",
      avatarUrl: base64Data,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove private profile picture
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    return NextResponse.json({ success: true, message: "Profile picture removed" });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

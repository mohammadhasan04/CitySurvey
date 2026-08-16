// Notification API route
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: true, data: [], unreadCount: 0 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });

    return NextResponse.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    console.error("Notifications GET Error:", error);
    return NextResponse.json({ success: true, data: [], unreadCount: 0 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "CITY_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { title, message, userId } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Title and message are required" }, { status: 400 });
    }

    let targetUserIds: string[] = [];
    if (userId) {
      targetUserIds = [userId];
    } else {
      const residents = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      targetUserIds = residents.map((r) => r.id);
    }

    await prisma.notification.createMany({
      data: targetUserIds.map((uId) => ({
        title,
        message,
        userId: uId,
      })),
    });

    return NextResponse.json({ success: true, count: targetUserIds.length });
  } catch (error) {
    console.error("Notifications POST Error:", error);
    return NextResponse.json({ success: false, error: "Failed to send notification" }, { status: 500 });
  }
}

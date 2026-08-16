import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const areas = await prisma.area.findMany({
      where: { deletedAt: null },
      include: {
        ward: { select: { id: true, name: true, wardNumber: true } },
        _count: {
          select: {
            streets: { where: { deletedAt: null } },
            households: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: areas });
  } catch (error) {
    console.error("Areas error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["CITY_ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, wardId, description } = body;

    if (!name || !wardId) {
      return NextResponse.json({ error: "Area name and ward selection are required" }, { status: 400 });
    }

    const area = await prisma.area.create({
      data: {
        name,
        wardId,
        description: description || null,
      },
      include: {
        ward: { select: { name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Area",
        entityId: area.id,
        details: JSON.stringify({ name: area.name, wardId: area.wardId }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: area }, { status: 201 });
  } catch (error) {
    console.error("Create area error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["CITY_ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, wardId, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Area ID is required" }, { status: 400 });
    }

    const updated = await prisma.area.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(wardId ? { wardId } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "Area",
        entityId: updated.id,
        details: JSON.stringify({ name: updated.name }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update area error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["CITY_ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Area ID is required" }, { status: 400 });
    }

    const softDeleted = await prisma.area.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entity: "Area",
        entityId: softDeleted.id,
        details: JSON.stringify({ name: softDeleted.name }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Area deleted successfully" });
  } catch (error) {
    console.error("Delete area error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

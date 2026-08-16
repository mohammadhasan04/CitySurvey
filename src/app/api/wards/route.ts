import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - List wards
export async function GET() {
  try {
    const wards = await prisma.ward.findMany({
      where: { deletedAt: null },
      orderBy: { wardNumber: "asc" },
      include: {
        _count: {
          select: {
            areas: { where: { deletedAt: null } },
            households: { where: { deletedAt: null } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: wards });
  } catch (error) {
    console.error("Wards list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create ward
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["CITY_ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, wardNumber, description } = body;

    if (!name || !wardNumber) {
      return NextResponse.json({ error: "Name and ward number are required" }, { status: 400 });
    }

    const existing = await prisma.ward.findFirst({
      where: { wardNumber: parseInt(wardNumber), deletedAt: null },
    });

    if (existing) {
      return NextResponse.json({ error: "Ward number already exists" }, { status: 409 });
    }

    const ward = await prisma.ward.create({
      data: {
        name,
        wardNumber: parseInt(wardNumber),
        description: description || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Ward",
        entityId: ward.id,
        details: JSON.stringify({ name: ward.name, wardNumber: ward.wardNumber }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: ward }, { status: 201 });
  } catch (error) {
    console.error("Create ward error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update ward
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["CITY_ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, wardNumber, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Ward ID is required" }, { status: 400 });
    }

    const updated = await prisma.ward.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(wardNumber ? { wardNumber: parseInt(wardNumber) } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "Ward",
        entityId: updated.id,
        details: JSON.stringify({ name: updated.name, wardNumber: updated.wardNumber }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update ward error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Soft delete ward
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["CITY_ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Ward ID is required" }, { status: 400 });
    }

    const now = new Date();
    const softDeleted = await prisma.ward.update({
      where: { id },
      data: { deletedAt: now },
    });

    // Cascade soft delete to child areas and households
    await Promise.all([
      prisma.area.updateMany({ where: { wardId: id, deletedAt: null }, data: { deletedAt: now } }),
      prisma.household.updateMany({ where: { wardId: id, deletedAt: null }, data: { deletedAt: now } }),
    ]);

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entity: "Ward",
        entityId: softDeleted.id,
        details: JSON.stringify({ name: softDeleted.name }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Ward deleted successfully" });
  } catch (error) {
    console.error("Delete ward error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

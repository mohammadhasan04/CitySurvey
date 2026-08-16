import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const buildings = await prisma.building.findMany({
      where: { deletedAt: null },
      include: {
        street: { select: { id: true, name: true } },
        _count: { select: { households: { where: { deletedAt: null } } } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: buildings });
  } catch (error) {
    console.error("Buildings error:", error);
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
    const { name, streetId, houseNumber, description } = body;

    if (!name || !streetId) {
      return NextResponse.json({ error: "Building name and street selection are required" }, { status: 400 });
    }

    const building = await prisma.building.create({
      data: {
        name,
        streetId,
        houseNumber: houseNumber || "1",
        description: description || null,
      },
      include: {
        street: { select: { name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Building",
        entityId: building.id,
        details: JSON.stringify({ name: building.name, streetId: building.streetId }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: building }, { status: 201 });
  } catch (error) {
    console.error("Create building error:", error);
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
    const { id, name, streetId, houseNumber, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Building ID is required" }, { status: 400 });
    }

    const updated = await prisma.building.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(streetId ? { streetId } : {}),
        ...(houseNumber ? { houseNumber } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "Building",
        entityId: updated.id,
        details: JSON.stringify({ name: updated.name }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update building error:", error);
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
      return NextResponse.json({ error: "Building ID is required" }, { status: 400 });
    }

    const softDeleted = await prisma.building.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entity: "Building",
        entityId: softDeleted.id,
        details: JSON.stringify({ name: softDeleted.name }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Building deleted successfully" });
  } catch (error) {
    console.error("Delete building error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const streets = await prisma.street.findMany({
      where: { deletedAt: null },
      include: {
        area: { select: { id: true, name: true } },
        _count: { select: { households: { where: { deletedAt: null } } } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: streets });
  } catch (error) {
    console.error("Streets error:", error);
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
    let { name, areaId, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Street name is required" }, { status: 400 });
    }

    if (!areaId) {
      let defaultArea = await prisma.area.findFirst({ where: { deletedAt: null } });
      if (!defaultArea) {
        const firstWard = await prisma.ward.findFirst({ where: { deletedAt: null } });
        if (firstWard) {
          defaultArea = await prisma.area.create({
            data: { name: "Bhatkal", wardId: firstWard.id },
          });
        }
      }
      if (defaultArea) areaId = defaultArea.id;
    }

    const street = await prisma.street.create({
      data: {
        name,
        areaId,
        description: description || null,
      },
      include: {
        area: { select: { name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Street",
        entityId: street.id,
        details: JSON.stringify({ name: street.name, areaId: street.areaId }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: street }, { status: 201 });
  } catch (error) {
    console.error("Create street error:", error);
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
    const { id, name, areaId, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Street ID is required" }, { status: 400 });
    }

    const updated = await prisma.street.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(areaId ? { areaId } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "Street",
        entityId: updated.id,
        details: JSON.stringify({ name: updated.name }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update street error:", error);
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
      return NextResponse.json({ error: "Street ID is required" }, { status: 400 });
    }

    const softDeleted = await prisma.street.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entity: "Street",
        entityId: softDeleted.id,
        details: JSON.stringify({ name: softDeleted.name }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Street deleted successfully" });
  } catch (error) {
    console.error("Delete street error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const household = await prisma.household.findUnique({
      where: { id, deletedAt: null },
      include: {
        ward: true,
        street: true,
        familyMembers: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!household) {
      return NextResponse.json(
        { error: "Household not found" },
        { status: 404 }
      );
    }

    // Residents can only see their own household
    if (
      session.user.role === "RESIDENT" &&
      session.user.householdId !== household.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: household });
  } catch (error) {
    console.error("Household API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !["CITY_ADMIN", "SUPER_ADMIN", "RESIDENT"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { surveyStatus, houseNumber, headOfFamily, address, phone, email } = body;

    const updated = await prisma.household.update({
      where: { id },
      data: {
        ...(surveyStatus ? { surveyStatus } : {}),
        ...(houseNumber ? { houseNumber } : {}),
        ...(headOfFamily ? { headOfFamily } : {}),
        ...(address ? { address } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(email !== undefined ? { email } : {}),
      },
      include: {
        ward: true,
        street: true,
        familyMembers: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_HOUSEHOLD",
        entity: "Household",
        entityId: id,
        details: JSON.stringify({ surveyStatus, updatedBy: session.user.email }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update household error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

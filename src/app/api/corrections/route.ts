import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - List correction requests
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: Record<string, unknown> = {};
    if (session.user.role === "RESIDENT") {
      where.userId = session.user.id;
    }

    const requests = await prisma.correctionRequest.findMany({
      where,
      include: {
        household: { select: { id: true, surveyId: true, headOfFamily: true, houseNumber: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error("Corrections GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Submit new correction request (Resident or Admin)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { field, currentValue, requestedValue, reason, householdId } = body;

    const targetHouseholdId = householdId || session.user.householdId;
    if (!targetHouseholdId) {
      return NextResponse.json({ error: "Household reference is required" }, { status: 400 });
    }

    const description = `Field: ${field || "General"} | From: "${currentValue || "—"}" | To: "${requestedValue || "—"}" | Reason: ${reason || "N/A"}`;

    const correction = await prisma.correctionRequest.create({
      data: {
        householdId: targetHouseholdId,
        userId: session.user.id,
        description,
        status: "PENDING",
      },
      include: {
        household: { select: { surveyId: true, headOfFamily: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "CorrectionRequest",
        entityId: correction.id,
        details: JSON.stringify({ field, requestedValue }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: correction }, { status: 201 });
  } catch (error) {
    console.error("Create correction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Approve or Reject correction request (City Admin / Super Admin)
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["CITY_ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, response } = body;

    if (!id || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Valid correction ID and status (APPROVED or REJECTED) are required" }, { status: 400 });
    }

    const updated = await prisma.correctionRequest.update({
      where: { id },
      data: {
        status,
        response: response || `Request ${status.toLowerCase()} by municipal administration.`,
      },
      include: {
        household: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "CorrectionRequest",
        entityId: updated.id,
        details: JSON.stringify({ status: updated.status }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update correction status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

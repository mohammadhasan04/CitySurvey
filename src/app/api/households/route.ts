import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - List all households with pagination/search
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Residents can fetch their own household
    if (session.user.role === "RESIDENT") {
      if (!session.user.householdId) {
        return NextResponse.json({ success: true, data: [] });
      }
      const myHousehold = await prisma.household.findMany({
        where: { id: session.user.householdId, deletedAt: null },
        include: {
          ward: { select: { name: true, wardNumber: true } },
          area: { select: { name: true } },
          street: { select: { name: true } },
          _count: { select: { familyMembers: { where: { deletedAt: null } } } },
        },
      });
      return NextResponse.json({ success: true, data: myHousehold });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const wardId = searchParams.get("wardId") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.OR = [
        { surveyId: { contains: search, mode: "insensitive" } },
        { houseNumber: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { headOfFamily: { contains: search, mode: "insensitive" } },
      ];
    }
    if (wardId) where.wardId = wardId;
    if (status) where.surveyStatus = status;

    const [households, total] = await Promise.all([
      prisma.household.findMany({
        where,
        include: {
          ward: { select: { name: true, wardNumber: true } },
          area: { select: { name: true } },
          street: { select: { name: true } },
          _count: { select: { familyMembers: { where: { deletedAt: null } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.household.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: households,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Households list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new household (Admin or Resident Self-Register)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { houseNumber, address, headOfFamily, phone, email, wardId, areaId, streetId, buildingId } = body;

    if (!houseNumber || !address || !wardId) {
      return NextResponse.json(
        { error: "House number, address, and ward are required" },
        { status: 400 }
      );
    }

    const { generateShortSurveyId } = await import("@/lib/utils");
    const surveyId = body.surveyId || generateShortSurveyId();

    // Ensure areaId and streetId are valid non-null strings
    let resolvedAreaId = areaId;
    if (!resolvedAreaId) {
      let defaultArea = await prisma.area.findFirst({ where: { wardId, deletedAt: null } });
      if (!defaultArea) {
        const ward = await prisma.ward.findUnique({ where: { id: wardId } });
        defaultArea = await prisma.area.create({
          data: { name: "Bhatkal", wardId },
        });
      }
      resolvedAreaId = defaultArea.id;
    }

    let resolvedStreetId = streetId;
    if (!resolvedStreetId) {
      let defaultStreet = await prisma.street.findFirst({ where: { areaId: resolvedAreaId, deletedAt: null } });
      if (!defaultStreet) {
        defaultStreet = await prisma.street.create({
          data: { name: "Main Street", areaId: resolvedAreaId },
        });
      }
      resolvedStreetId = defaultStreet.id;
    }

    const household = await prisma.household.create({
      data: {
        surveyId,
        houseNumber,
        headOfFamily: headOfFamily || session.user.name || "Head of Household",
        address,
        phone: phone || null,
        email: email || session.user.email || null,
        wardId,
        areaId: resolvedAreaId,
        streetId: resolvedStreetId,
        buildingId: buildingId || null,
        surveyStatus: "PENDING",
      },
      include: {
        ward: { select: { name: true, wardNumber: true } },
        area: { select: { name: true } },
        street: { select: { name: true } },
      },
    });

    // If user is RESIDENT, link this household to their user account immediately
    if (session.user.role === "RESIDENT" || !session.user.householdId) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { householdId: household.id },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Household",
        entityId: household.id,
        details: JSON.stringify({ surveyId: household.surveyId, role: session.user.role }),
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { success: true, data: household },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create household error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete household & associated members
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["CITY_ADMIN", "SUPER_ADMIN", "RESIDENT"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Household ID is required" }, { status: 400 });
    }

    const now = new Date();
    const household = await prisma.household.update({
      where: { id },
      data: { deletedAt: now },
    });

    await prisma.familyMember.updateMany({
      where: { householdId: id },
      data: { deletedAt: now },
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_HOUSEHOLD",
        entity: "Household",
        entityId: id,
        details: JSON.stringify({ surveyId: household.surveyId, deletedBy: session.user.email }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Household and associated members deleted successfully" });
  } catch (error) {
    console.error("Delete household error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "RESIDENT") {
      if (!session.user.householdId) {
        return NextResponse.json({ success: true, data: [] });
      }
      const members = await prisma.familyMember.findMany({
        where: { householdId: session.user.householdId, deletedAt: null },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ success: true, data: members });
    }

    const residents = await prisma.familyMember.findMany({
      where: { deletedAt: null },
      include: {
        household: { select: { surveyId: true, houseNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ success: true, data: residents });
  } catch (error) {
    console.error("Residents list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, relationship, gender, dateOfBirth, phone, educationLevel, employmentStatus, isLivingAbroad, country, householdId } = body;

    const targetHouseholdId = session.user.role === "RESIDENT" ? session.user.householdId : (householdId || session.user.householdId);

    if (!targetHouseholdId) {
      return NextResponse.json({ error: "No household linked. Please register a household first." }, { status: 400 });
    }

    if (!fullName || !relationship || !gender || !dateOfBirth) {
      return NextResponse.json({ error: "Full name, relationship, gender, and date of birth are required." }, { status: 400 });
    }

    const validGender = ["MALE", "FEMALE", "OTHER"].includes(gender) ? gender : "MALE";

    const newMember = await prisma.familyMember.create({
      data: {
        householdId: targetHouseholdId,
        fullName,
        relationship,
        gender: validGender as any,
        dateOfBirth: new Date(dateOfBirth),
        phone: phone || null,
        educationStatus: educationLevel || null,
        employmentStatus: (employmentStatus as any) || "OTHER",
        livingAbroad: Boolean(isLivingAbroad),
        livingHere: !Boolean(isLivingAbroad),
        country: isLivingAbroad ? (country || "United Arab Emirates") : null,
      },
    });

    // Update totalMembers count on household
    const activeCount = await prisma.familyMember.count({
      where: { householdId: targetHouseholdId, deletedAt: null },
    });

    await prisma.household.update({
      where: { id: targetHouseholdId },
      data: { totalMembers: activeCount },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "FamilyMember",
        entityId: newMember.id,
        details: JSON.stringify({ fullName: newMember.fullName, relationship: newMember.relationship }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: newMember }, { status: 201 });
  } catch (error) {
    console.error("Create resident error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Soft delete family member / resident
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const member = await prisma.familyMember.findUnique({ where: { id } });
    if (!member) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 });
    }

    const softDeleted = await prisma.familyMember.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Update totalMembers count on household
    const activeCount = await prisma.familyMember.count({
      where: { householdId: member.householdId, deletedAt: null },
    });

    await prisma.household.update({
      where: { id: member.householdId },
      data: { totalMembers: activeCount },
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_RESIDENT",
        entity: "FamilyMember",
        entityId: id,
        details: JSON.stringify({ fullName: member.fullName, deletedBy: session.user.email }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Resident removed successfully" });
  } catch (error) {
    console.error("Delete resident error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

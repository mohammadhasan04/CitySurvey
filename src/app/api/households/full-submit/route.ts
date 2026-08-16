import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      houseNumber,
      headOfFamily,
      address,
      phone,
      email,
      wardId,
      areaId,
      streetId,
      buildingId,
      familyMembers,
    } = body;

    if (!houseNumber || !address || !wardId) {
      return NextResponse.json(
        { error: "House number, address, and ward selection are required." },
        { status: 400 }
      );
    }

    const { generateShortSurveyId } = await import("@/lib/utils");
    const surveyId = generateShortSurveyId();
    const membersList = Array.isArray(familyMembers) ? familyMembers : [];

    // Helper for robust Date parsing
    const parseDob = (dobStr: any) => {
      if (!dobStr) return new Date("2000-01-01");
      const parsed = new Date(dobStr);
      if (!isNaN(parsed.getTime())) return parsed;
      const parts = String(dobStr).split("/");
      if (parts.length === 3) {
        const [m, d, y] = parts;
        const alt = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
        if (!isNaN(alt.getTime())) return alt;
      }
      return new Date("2000-01-01");
    };

    // Execute atomic transaction to create Household & all Family Members
    const result = await prisma.$transaction(async (tx) => {
      // Resolve valid Area ID
      let resolvedAreaId = areaId;
      if (!resolvedAreaId) {
        let defaultArea = await tx.area.findFirst({ where: { wardId, deletedAt: null } });
        if (!defaultArea) {
          const ward = await tx.ward.findUnique({ where: { id: wardId } });
          defaultArea = await tx.area.create({
            data: { name: "Bhatkal", wardId },
          });
        }
        resolvedAreaId = defaultArea.id;
      }

      // Resolve valid Street ID
      let resolvedStreetId = streetId;
      if (!resolvedStreetId) {
        let defaultStreet = await tx.street.findFirst({
          where: { areaId: resolvedAreaId, deletedAt: null },
        });
        if (!defaultStreet) {
          defaultStreet = await tx.street.create({
            data: { name: "Main Street", areaId: resolvedAreaId },
          });
        }
        resolvedStreetId = defaultStreet.id;
      }

      const household = await tx.household.create({
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
          totalMembers: membersList.length,
          surveyStatus: "PENDING",
        },
      });

      // Link User to this Household
      await tx.user.update({
        where: { id: session.user.id },
        data: { householdId: household.id },
      });

      // Create Family Members if any provided
      if (membersList.length > 0) {
        await tx.familyMember.createMany({
          data: membersList.map((m: any) => ({
            householdId: household.id,
            fullName: m.fullName,
            relationship: m.relationship || "Member",
            gender: ["MALE", "FEMALE", "OTHER"].includes(m.gender) ? m.gender : "MALE",
            dateOfBirth: parseDob(m.dateOfBirth),
            phone: m.phone || null,
            educationStatus: m.educationLevel || null,
            employmentStatus: (m.employmentStatus as any) || "OTHER",
            livingAbroad: Boolean(m.isLivingAbroad),
            livingHere: !Boolean(m.isLivingAbroad),
            country: m.isLivingAbroad ? m.country || "Saudi Arabia" : null,
          })),
        });
      }

      return household;
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Household",
        entityId: result.id,
        details: JSON.stringify({ surveyId: result.surveyId, totalMembers: membersList.length }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error("Full household submission error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

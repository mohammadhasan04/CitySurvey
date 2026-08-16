import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { WardStatistics } from "@/types";
import { AGE_CATEGORIES } from "@/lib/constants";

export async function GET() {
  try {
    const wards = await prisma.ward.findMany({
      where: { deletedAt: null },
      orderBy: { wardNumber: "asc" },
    });

    const wardStats: WardStatistics[] = [];

    for (const ward of wards) {
      const [
        totalHouseholds,
        members,
        completedSurvey,
        pendingSurvey,
      ] = await Promise.all([
        prisma.household.count({
          where: { wardId: ward.id, deletedAt: null },
        }),
        prisma.familyMember.findMany({
          where: {
            household: { wardId: ward.id, deletedAt: null },
            deletedAt: null,
          },
          select: {
            gender: true,
            dateOfBirth: true,
            isStudent: true,
            employmentStatus: true,
            livingAbroad: true,
          },
        }),
        prisma.household.count({
          where: {
            wardId: ward.id,
            surveyStatus: { in: ["COMPLETED", "VERIFIED"] },
            deletedAt: null,
          },
        }),
        prisma.household.count({
          where: {
            wardId: ward.id,
            surveyStatus: { in: ["PENDING", "IN_PROGRESS"] },
            deletedAt: null,
          },
        }),
      ]);

      const now = new Date();
      let children = 0, adults = 0, seniors = 0;
      let male = 0, female = 0, other = 0;
      let students = 0, working = 0, unemployed = 0, abroad = 0;

      for (const m of members) {
        if (m.gender === "MALE") male++;
        else if (m.gender === "FEMALE") female++;
        else other++;

        const age = Math.floor(
          (now.getTime() - new Date(m.dateOfBirth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        );
        if (age <= AGE_CATEGORIES.CHILD.max) children++;
        else if (age <= AGE_CATEGORIES.ADULT.max) adults++;
        else seniors++;

        if (m.isStudent || m.employmentStatus === "STUDENT") students++;
        if (["EMPLOYED", "SELF_EMPLOYED"].includes(m.employmentStatus)) working++;
        if (m.employmentStatus === "UNEMPLOYED") unemployed++;
        if (m.livingAbroad) abroad++;
      }

      wardStats.push({
        wardId: ward.id,
        wardName: ward.name,
        wardNumber: ward.wardNumber,
        totalPopulation: members.length,
        totalHouseholds,
        totalMale: male,
        totalFemale: female,
        totalOther: other,
        totalChildren: children,
        totalAdults: adults,
        totalSeniors: seniors,
        totalStudents: students,
        totalWorking: working,
        totalUnemployed: unemployed,
        totalLivingAbroad: abroad,
        totalSurveyCompleted: completedSurvey,
        totalSurveyPending: pendingSurvey,
      });
    }

    return NextResponse.json({ success: true, data: wardStats });
  } catch (error) {
    console.error("Ward statistics API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ward statistics" },
      { status: 500 }
    );
  }
}

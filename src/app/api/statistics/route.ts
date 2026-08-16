import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { CityStatistics } from "@/types";
import { AGE_CATEGORIES } from "@/lib/constants";

export async function GET() {
  try {
    const now = new Date();
    const fourteenYearsAgo = new Date(now.getFullYear() - 14, now.getMonth(), now.getDate());
    const fiftyNineYearsAgo = new Date(now.getFullYear() - 59, now.getMonth(), now.getDate());

    const [
      totalHouseholds,
      totalMembers,
      genderCounts,
      studentCount,
      employedCount,
      unemployedCount,
      abroadCount,
      completedSurvey,
      pendingSurvey,
      totalChildren,
      totalAdults,
      totalSeniors,
    ] = await Promise.all([
      prisma.household.count({ where: { deletedAt: null } }),
      prisma.familyMember.count({ where: { deletedAt: null } }),
      prisma.familyMember.groupBy({
        by: ["gender"],
        _count: true,
        where: { deletedAt: null },
      }),
      prisma.familyMember.count({
        where: {
          OR: [{ isStudent: true }, { employmentStatus: "STUDENT" }],
          deletedAt: null,
        },
      }),
      prisma.familyMember.count({
        where: {
          employmentStatus: { in: ["EMPLOYED", "SELF_EMPLOYED"] },
          deletedAt: null,
        },
      }),
      prisma.familyMember.count({
        where: { employmentStatus: "UNEMPLOYED", deletedAt: null },
      }),
      prisma.familyMember.count({
        where: { livingAbroad: true, deletedAt: null },
      }),
      prisma.household.count({
        where: {
          surveyStatus: { in: ["COMPLETED", "VERIFIED"] },
          deletedAt: null,
        },
      }),
      prisma.household.count({
        where: {
          surveyStatus: { in: ["PENDING", "IN_PROGRESS"] },
          deletedAt: null,
        },
      }),
      prisma.familyMember.count({
        where: { dateOfBirth: { gte: fourteenYearsAgo }, deletedAt: null },
      }),
      prisma.familyMember.count({
        where: { dateOfBirth: { gte: fiftyNineYearsAgo, lt: fourteenYearsAgo }, deletedAt: null },
      }),
      prisma.familyMember.count({
        where: { dateOfBirth: { lt: fiftyNineYearsAgo }, deletedAt: null },
      }),
    ]);

    // Calculate gender breakdown
    const maleCount =
      genderCounts.find((g) => g.gender === "MALE")?._count ?? 0;
    const femaleCount =
      genderCounts.find((g) => g.gender === "FEMALE")?._count ?? 0;
    const otherCount =
      genderCounts.find((g) => g.gender === "OTHER")?._count ?? 0;

    const stats: CityStatistics = {
      totalPopulation: totalMembers,
      totalHouseholds,
      totalMale: maleCount,
      totalFemale: femaleCount,
      totalOther: otherCount,
      totalChildren,
      totalAdults,
      totalSeniors,
      totalStudents: studentCount,
      totalWorking: employedCount,
      totalUnemployed: unemployedCount,
      totalLivingAbroad: abroadCount,
      totalSurveyCompleted: completedSurvey,
      totalSurveyPending: pendingSurvey,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("Statistics API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

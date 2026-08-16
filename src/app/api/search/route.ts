import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["CITY_ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (q.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const [households, members, wards] = await Promise.all([
      prisma.household.findMany({
        where: {
          deletedAt: null,
          OR: [
            { surveyId: { contains: q, mode: "insensitive" } },
            { houseNumber: { contains: q, mode: "insensitive" } },
            { headOfFamily: { contains: q, mode: "insensitive" } },
            { address: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          surveyId: true,
          headOfFamily: true,
          houseNumber: true,
          address: true,
          ward: { select: { name: true } },
        },
        take: 10,
      }),
      prisma.familyMember.findMany({
        where: {
          deletedAt: null,
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { relationship: { contains: q, mode: "insensitive" } },
            { occupation: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          fullName: true,
          phone: true,
          relationship: true,
          household: { select: { surveyId: true } },
        },
        take: 10,
      }),
      prisma.ward.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          wardNumber: true,
        },
        take: 5,
      }),
    ]);

    const results = [
      ...households.map((h) => ({
        type: "household" as const,
        id: h.id,
        title: `${h.headOfFamily} — ${h.houseNumber}`,
        subtitle: `Survey ${h.surveyId} | ${h.ward.name} | ${h.address}`,
      })),
      ...members.map((m) => ({
        type: "member" as const,
        id: m.id,
        title: m.fullName,
        subtitle: `${m.relationship} | Survey ${m.household.surveyId} | ${m.phone || "No phone"}`,
      })),
      ...wards.map((w) => ({
        type: "ward" as const,
        id: w.id,
        title: `Ward ${w.wardNumber} — ${w.name}`,
        subtitle: `Ward ID: ${w.id}`,
      })),
    ];

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

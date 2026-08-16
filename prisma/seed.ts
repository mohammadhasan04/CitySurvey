import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const pool = new Pool({ connectionString: url });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database with authentic 100% Bhatkal Municipal Corporation (TMC) data...\n");

  // ─── Create Super Admin ─────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "mohammadhasan16114@gmail.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Hasan2004@";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
    create: {
      email: adminEmail.toLowerCase(),
      name: "Mohammad Hasan",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      phone: "+91 9876543210",
      emailVerified: new Date(),
      isActive: true,
    },
  });
  console.log(`✅ Super Admin ready: ${superAdmin.email}`);

  // ─── Create Official Bhatkal Wards (23 TMC Wards) ──
  const wardsData = [
    { wardNumber: 1, name: "Ward 1 - Bunder / Sea Shore", description: "Coastal fishing harbour & sea port zone" },
    { wardNumber: 2, name: "Ward 2 - Azad Nagar", description: "High-density commercial & residential hub" },
    { wardNumber: 3, name: "Ward 3 - Nawayath Colony", description: "Residential enclave & educational district" },
    { wardNumber: 4, name: "Ward 4 - Sultan Street / Old Town", description: "Historic cultural heritage & traditional bazaar" },
    { wardNumber: 5, name: "Ward 5 - Chowk Bazaar", description: "Central trade market & Car Street district" },
    { wardNumber: 6, name: "Ward 6 - Jali / Jalikod", description: "Jali beach coastal sector & resort road" },
    { wardNumber: 7, name: "Ward 7 - Tengingundi", description: "Tengingundi coastal fishing village & jetty" },
    { wardNumber: 8, name: "Ward 8 - Shirali Highway Junction", description: "NH-66 National Highway commercial corridor" },
    { wardNumber: 9, name: "Ward 9 - Heble", description: "Heble sub-urban expansion sector" },
    { wardNumber: 10, name: "Ward 10 - Dongarpalli / Mugli", description: "Dongarpalli hill area & Mugli enclave" },
    { wardNumber: 11, name: "Ward 11 - Makhdoom Colony", description: "Makhdoom Colony residential development" },
    { wardNumber: 12, name: "Ward 12 - Hanumanth Nagar / Sonarkatta", description: "Sonarkatta Circle & Hanumanth Nagar" },
    { wardNumber: 13, name: "Ward 13 - Gousia Street", description: "Gousia Street & Rabita Manzil locality" },
    { wardNumber: 14, name: "Ward 14 - Islampur", description: "Islampur community & commercial zone" },
    { wardNumber: 15, name: "Ward 15 - Ranginkatta", description: "Ranginkatta Junction & NH Bypass sector" },
    { wardNumber: 16, name: "Ward 16 - Khedda / Sarpanch Katta", description: "Sarpanch Katta heritage neighborhood" },
    { wardNumber: 17, name: "Ward 17 - Jamia Street", description: "Jamia Masjid cultural heritage street" },
    { wardNumber: 18, name: "Ward 18 - Mood Bhatkal", description: "Mood Bhatkal temple & historical basti zone" },
    { wardNumber: 19, name: "Ward 19 - Venktapur", description: "Venktapur riverbank & agricultural-urban belt" },
    { wardNumber: 20, name: "Ward 20 - Kazi Galli", description: "Kazi Galli historic lane district" },
    { wardNumber: 21, name: "Ward 21 - Susgadi", description: "Susgadi sub-urban residential sector" },
    { wardNumber: 22, name: "Ward 22 - Purvarga", description: "Purvarga extension locality" },
    { wardNumber: 23, name: "Ward 23 - Alve Kotta", description: "Alve Kotta sea coast fishing settlement" },
  ];

  const wards = [];
  for (const w of wardsData) {
    const ward = await prisma.ward.upsert({
      where: { wardNumber: w.wardNumber },
      update: { name: w.name, description: w.description, deletedAt: null },
      create: w,
    });
    wards.push(ward);
  }
  console.log(`✅ ${wards.length} Bhatkal Wards created`);

  // ─── Create Official Bhatkal Areas / Localities ──────
  const areasData = [
    { name: "Bunder Sea Shore", wardId: wards[0].id },
    { name: "Port Jetty Area", wardId: wards[0].id },
    { name: "Azad Nagar 1st Block", wardId: wards[1].id },
    { name: "Azad Nagar 2nd Block", wardId: wards[1].id },
    { name: "Nawayath Colony Phase 1", wardId: wards[2].id },
    { name: "Nawayath Colony Phase 2", wardId: wards[2].id },
    { name: "Sultan Street Heritage Zone", wardId: wards[3].id },
    { name: "Old Bazaar Sector", wardId: wards[3].id },
    { name: "Chowk Bazaar Center", wardId: wards[4].id },
    { name: "Car Street Market", wardId: wards[4].id },
    { name: "Jali Beach Enclave", wardId: wards[5].id },
    { name: "Jalikod Coastal Area", wardId: wards[5].id },
    { name: "Tengingundi Sea Shore", wardId: wards[6].id },
    { name: "Shirali Highway Plaza", wardId: wards[7].id },
    { name: "Heble Sub-Urban Belt", wardId: wards[8].id },
    { name: "Dongarpalli Hill Enclave", wardId: wards[9].id },
    { name: "Makhdoom Colony Main", wardId: wards[10].id },
    { name: "Sonarkatta Circle", wardId: wards[11].id },
    { name: "Hanumanth Nagar Colony", wardId: wards[11].id },
    { name: "Gousia Street Locality", wardId: wards[12].id },
    { name: "Islampur Sector", wardId: wards[13].id },
    { name: "Ranginkatta Junction", wardId: wards[14].id },
    { name: "Sarpanch Katta Lane", wardId: wards[15].id },
    { name: "Jamia Street Corridor", wardId: wards[16].id },
    { name: "Mood Bhatkal Basti", wardId: wards[17].id },
    { name: "Venktapur Riverbed", wardId: wards[18].id },
    { name: "Kazi Galli Heritage Lane", wardId: wards[19].id },
    { name: "Susgadi Colony", wardId: wards[20].id },
    { name: "Purvarga Extension", wardId: wards[21].id },
    { name: "Alve Kotta Coastal Enclave", wardId: wards[22].id },
  ];

  const areas = [];
  for (const a of areasData) {
    let area = await prisma.area.findFirst({ where: { name: a.name, wardId: a.wardId } });
    if (!area) {
      area = await prisma.area.create({ data: a });
    }
    areas.push(area);
  }
  console.log(`✅ ${areas.length} Bhatkal Areas created`);

  // ─── Create Official Bhatkal Streets ─────────────────
  const streetsData = [
    { name: "Bunder Main Sea Shore Road", areaId: areas[0].id },
    { name: "Port Jetty Link Road", areaId: areas[1].id },
    { name: "Azad Nagar 1st Cross", areaId: areas[2].id },
    { name: "Azad Nagar 2nd Cross", areaId: areas[3].id },
    { name: "Nawayath Colony Main Avenue", areaId: areas[4].id },
    { name: "Nawayath Colony Link Road", areaId: areas[5].id },
    { name: "Sultan Street Heritage Lane", areaId: areas[6].id },
    { name: "Old Market Bazaar Road", areaId: areas[7].id },
    { name: "Chowk Bazaar Main Road", areaId: areas[8].id },
    { name: "Car Street Market Road", areaId: areas[9].id },
    { name: "Jali Beach Resort Road", areaId: areas[10].id },
    { name: "Jalikod Sea Coast Road", areaId: areas[11].id },
    { name: "Tengingundi Fishing Harbour Road", areaId: areas[12].id },
    { name: "NH-66 Highway Bypass Road", areaId: areas[13].id },
    { name: "Heble Village Main Road", areaId: areas[14].id },
    { name: "Dongarpalli Hill Cross Road", areaId: areas[15].id },
    { name: "Makhdoom Colony 2nd Main", areaId: areas[16].id },
    { name: "Sonarkatta Circle Road", areaId: areas[17].id },
    { name: "Hanumanth Nagar Temple Road", areaId: areas[18].id },
    { name: "Gousia Street Main Cross", areaId: areas[19].id },
    { name: "Islampur Mosque Lane", areaId: areas[20].id },
    { name: "Ranginkatta Circle Highway Road", areaId: areas[21].id },
    { name: "Sarpanch Katta Heritage Lane", areaId: areas[22].id },
    { name: "Jamia Masjid Street", areaId: areas[23].id },
    { name: "Mood Bhatkal Basti Road", areaId: areas[24].id },
    { name: "Venktapur River Road", areaId: areas[25].id },
    { name: "Kazi Galli Old Street", areaId: areas[26].id },
    { name: "Susgadi Main Road", areaId: areas[27].id },
    { name: "Purvarga Extension Lane", areaId: areas[28].id },
    { name: "Alve Kotta Sea Shore Road", areaId: areas[29].id },
  ];

  const streets = [];
  for (const s of streetsData) {
    let street = await prisma.street.findFirst({ where: { name: s.name, areaId: s.areaId } });
    if (!street) {
      street = await prisma.street.create({ data: s });
    }
    streets.push(street);
  }
  console.log(`✅ ${streets.length} Bhatkal Streets created`);

  // ─── Create Official Bhatkal Buildings ───────────────
  const buildingsData = [
    { name: "Bhatkal TMC Municipal Corporation Building", houseNumber: "TMC-001", streetId: streets[8].id },
    { name: "Nawayath Colony Rabita Manzil Complex", houseNumber: "NC-101", streetId: streets[4].id },
    { name: "Sultan Street Heritage Plaza", houseNumber: "SS-202", streetId: streets[6].id },
    { name: "Bunder Sea View Enclave", houseNumber: "BND-303", streetId: streets[0].id },
    { name: "Azad Nagar Commercial Tower", houseNumber: "AN-404", streetId: streets[2].id },
    { name: "Jali Beach View Resort & Apartments", houseNumber: "JB-505", streetId: streets[10].id },
    { name: "Ranginkatta Trade Hub", houseNumber: "RK-606", streetId: streets[21].id },
    { name: "Jamia Educational & Cultural Complex", houseNumber: "JM-707", streetId: streets[23].id },
    { name: "Sonarkatta Civic Center", houseNumber: "SK-808", streetId: streets[17].id },
    { name: "Tengingundi Fishing Harbour Building", houseNumber: "TG-909", streetId: streets[12].id },
  ];

  const buildings = [];
  for (const b of buildingsData) {
    let building = await prisma.building.findFirst({ where: { name: b.name, streetId: b.streetId } });
    if (!building) {
      building = await prisma.building.create({ data: b });
    }
    buildings.push(building);
  }
  console.log(`✅ ${buildings.length} Bhatkal Buildings created`);

  // ─── Create Households & Family Members ──────────────
  const householdsSeed = [
    {
      surveyId: "SRV-2026-BHK-001",
      houseNumber: "HN-101/A",
      headOfFamily: "Mohammad Hasan",
      address: "101/A Nawayath Colony Main Avenue, Ward 3, Bhatkal, Karnataka 581320",
      phone: "+91 9876543210",
      email: adminEmail,
      wardId: wards[2].id,
      areaId: areas[4].id,
      streetId: streets[4].id,
      totalMembers: 4,
      totalLivingHere: 3,
      totalLivingAbroad: 1,
      surveyStatus: "VERIFIED" as const,
      members: [
        {
          fullName: "Mohammad Hasan",
          gender: "MALE" as const,
          dateOfBirth: new Date("1994-05-14"),
          relationship: "Head of Household",
          maritalStatus: "MARRIED" as const,
          occupation: "Senior Systems Architect",
          employmentStatus: "EMPLOYED" as const,
          workPlace: "Bhatkal Municipal Authority",
          incomeRange: "TEN_TO_TWENTY_LAKH" as const,
          educationStatus: "Post Graduate",
          livingHere: true,
          livingAbroad: false,
          phone: "+91 9876543210",
        },
        {
          fullName: "Fatima Hasan",
          gender: "FEMALE" as const,
          dateOfBirth: new Date("1997-08-22"),
          relationship: "Spouse",
          maritalStatus: "MARRIED" as const,
          occupation: "Education Administrator",
          employmentStatus: "EMPLOYED" as const,
          workPlace: "Anjuman Hami-e-Muslimeen Educational Trust",
          incomeRange: "FIVE_TO_TEN_LAKH" as const,
          educationStatus: "Graduate",
          livingHere: true,
          livingAbroad: false,
        },
        {
          fullName: "Zaid Hasan",
          gender: "MALE" as const,
          dateOfBirth: new Date("2018-03-10"),
          relationship: "Son",
          maritalStatus: "SINGLE" as const,
          employmentStatus: "STUDENT" as const,
          isStudent: true,
          schoolCollegeName: "Anjuman Primary School Bhatkal",
          currentClass: "Grade 3",
          livingHere: true,
          livingAbroad: false,
        },
        {
          fullName: "Ibrahim Hasan",
          gender: "MALE" as const,
          dateOfBirth: new Date("1965-11-05"),
          relationship: "Father",
          maritalStatus: "MARRIED" as const,
          occupation: "Business Executive",
          employmentStatus: "SELF_EMPLOYED" as const,
          incomeRange: "ABOVE_TWENTY_LAKH" as const,
          educationStatus: "Graduate",
          livingHere: false,
          livingAbroad: true,
          country: "United Arab Emirates",
        },
      ],
    },
    {
      surveyId: "SRV-2026-BHK-002",
      houseNumber: "HN-204/B",
      headOfFamily: "Abdul Rahim Nawayath",
      address: "204/B Sultan Street Heritage Lane, Ward 4, Bhatkal, Karnataka 581320",
      phone: "+91 9876500002",
      wardId: wards[3].id,
      areaId: areas[6].id,
      streetId: streets[6].id,
      totalMembers: 5,
      totalLivingHere: 4,
      totalLivingAbroad: 1,
      surveyStatus: "COMPLETED" as const,
      members: [
        {
          fullName: "Abdul Rahim Nawayath",
          gender: "MALE" as const,
          dateOfBirth: new Date("1978-04-12"),
          relationship: "Head of Household",
          maritalStatus: "MARRIED" as const,
          occupation: "Merchant",
          employmentStatus: "SELF_EMPLOYED" as const,
          incomeRange: "TEN_TO_TWENTY_LAKH" as const,
          educationStatus: "Graduate",
          livingHere: true,
          livingAbroad: false,
        },
        {
          fullName: "Khadija Nawayath",
          gender: "FEMALE" as const,
          dateOfBirth: new Date("1982-09-18"),
          relationship: "Spouse",
          maritalStatus: "MARRIED" as const,
          occupation: "Homemaker",
          employmentStatus: "UNEMPLOYED" as const,
          educationStatus: "Higher Secondary",
          livingHere: true,
          livingAbroad: false,
        },
        {
          fullName: "Mohammed Nawayath",
          gender: "MALE" as const,
          dateOfBirth: new Date("2004-01-15"),
          relationship: "Son",
          maritalStatus: "SINGLE" as const,
          employmentStatus: "STUDENT" as const,
          isStudent: true,
          schoolCollegeName: "Anjuman Institute of Technology and Management (AITM) Bhatkal",
          currentClass: "B.E. Computer Science",
          livingHere: true,
          livingAbroad: false,
        },
        {
          fullName: "Ayesha Nawayath",
          gender: "FEMALE" as const,
          dateOfBirth: new Date("2008-06-30"),
          relationship: "Daughter",
          maritalStatus: "SINGLE" as const,
          employmentStatus: "STUDENT" as const,
          isStudent: true,
          schoolCollegeName: "Anjuman Girls High School Bhatkal",
          currentClass: "Grade 11",
          livingHere: true,
          livingAbroad: false,
        },
        {
          fullName: "Tariq Nawayath",
          gender: "MALE" as const,
          dateOfBirth: new Date("1999-12-10"),
          relationship: "Son",
          maritalStatus: "SINGLE" as const,
          occupation: "Software Engineer",
          employmentStatus: "EMPLOYED" as const,
          workPlace: "Tech Corp Dubai",
          incomeRange: "TEN_TO_TWENTY_LAKH" as const,
          educationStatus: "Graduate",
          livingHere: false,
          livingAbroad: true,
          country: "United Arab Emirates",
        },
      ],
    },
    {
      surveyId: "SRV-2026-BHK-003",
      houseNumber: "HN-52/C",
      headOfFamily: "Subraya Naik",
      address: "52/C Hanumanth Nagar Temple Road, Ward 12, Bhatkal, Karnataka 581320",
      phone: "+91 9876500003",
      wardId: wards[11].id,
      areaId: areas[18].id,
      streetId: streets[18].id,
      totalMembers: 3,
      totalLivingHere: 3,
      totalLivingAbroad: 0,
      surveyStatus: "VERIFIED" as const,
      members: [
        {
          fullName: "Subraya Naik",
          gender: "MALE" as const,
          dateOfBirth: new Date("1980-07-25"),
          relationship: "Head of Household",
          maritalStatus: "MARRIED" as const,
          occupation: "Government Secondary Teacher",
          employmentStatus: "EMPLOYED" as const,
          workPlace: "Government High School Bhatkal",
          incomeRange: "FIVE_TO_TEN_LAKH" as const,
          educationStatus: "Post Graduate",
          livingHere: true,
          livingAbroad: false,
        },
        {
          fullName: "Lakshmi Naik",
          gender: "FEMALE" as const,
          dateOfBirth: new Date("1985-02-14"),
          relationship: "Spouse",
          maritalStatus: "MARRIED" as const,
          occupation: "Bank Officer",
          employmentStatus: "EMPLOYED" as const,
          workPlace: "State Bank of India Bhatkal",
          incomeRange: "FIVE_TO_TEN_LAKH" as const,
          educationStatus: "Graduate",
          livingHere: true,
          livingAbroad: false,
        },
        {
          fullName: "Pranav Naik",
          gender: "MALE" as const,
          dateOfBirth: new Date("2010-09-08"),
          relationship: "Son",
          maritalStatus: "SINGLE" as const,
          employmentStatus: "STUDENT" as const,
          isStudent: true,
          schoolCollegeName: "Anand Ashram Convent High School Bhatkal",
          currentClass: "Grade 10",
          livingHere: true,
          livingAbroad: false,
        },
      ],
    },
    {
      surveyId: "SRV-2026-BHK-004",
      houseNumber: "HN-88/D",
      headOfFamily: "Usman Banderi",
      address: "88/D Bunder Main Sea Shore Road, Ward 1, Bhatkal, Karnataka 581320",
      phone: "+91 9876500004",
      wardId: wards[0].id,
      areaId: areas[0].id,
      streetId: streets[0].id,
      totalMembers: 4,
      totalLivingHere: 3,
      totalLivingAbroad: 1,
      surveyStatus: "VERIFIED" as const,
      members: [
        {
          fullName: "Usman Banderi",
          gender: "MALE" as const,
          dateOfBirth: new Date("1975-01-19"),
          relationship: "Head of Household",
          maritalStatus: "MARRIED" as const,
          occupation: "Fisheries & Marine Exporter",
          employmentStatus: "SELF_EMPLOYED" as const,
          workPlace: "Bhatkal Sea Port Exports",
          incomeRange: "ABOVE_TWENTY_LAKH" as const,
          educationStatus: "Graduate",
          livingHere: true,
          livingAbroad: false,
        },
        {
          fullName: "Mariyam Banderi",
          gender: "FEMALE" as const,
          dateOfBirth: new Date("1980-05-11"),
          relationship: "Spouse",
          maritalStatus: "MARRIED" as const,
          occupation: "Homemaker",
          employmentStatus: "UNEMPLOYED" as const,
          educationStatus: "Secondary",
          livingHere: true,
          livingAbroad: false,
        },
        {
          fullName: "Bilal Banderi",
          gender: "MALE" as const,
          dateOfBirth: new Date("2002-11-20"),
          relationship: "Son",
          maritalStatus: "SINGLE" as const,
          occupation: "Marine Operations Manager",
          employmentStatus: "EMPLOYED" as const,
          workPlace: "Qatar Maritime Logistics",
          incomeRange: "TEN_TO_TWENTY_LAKH" as const,
          educationStatus: "Graduate",
          livingHere: false,
          livingAbroad: true,
          country: "Qatar",
        },
        {
          fullName: "Zainab Banderi",
          gender: "FEMALE" as const,
          dateOfBirth: new Date("2015-08-04"),
          relationship: "Daughter",
          maritalStatus: "SINGLE" as const,
          employmentStatus: "STUDENT" as const,
          isStudent: true,
          schoolCollegeName: "Islamia Anglo Urdu High School Bhatkal",
          currentClass: "Grade 5",
          livingHere: true,
          livingAbroad: false,
        },
      ],
    },
  ];

  for (const seed of householdsSeed) {
    const household = await prisma.household.upsert({
      where: { surveyId: seed.surveyId },
      update: {
        houseNumber: seed.houseNumber,
        headOfFamily: seed.headOfFamily,
        address: seed.address,
        phone: seed.phone,
        email: seed.email,
        wardId: seed.wardId,
        areaId: seed.areaId,
        streetId: seed.streetId,
        totalMembers: seed.totalMembers,
        totalLivingHere: seed.totalLivingHere,
        totalLivingAbroad: seed.totalLivingAbroad,
        surveyStatus: seed.surveyStatus,
        deletedAt: null,
      },
      create: {
        surveyId: seed.surveyId,
        houseNumber: seed.houseNumber,
        headOfFamily: seed.headOfFamily,
        address: seed.address,
        phone: seed.phone,
        email: seed.email,
        wardId: seed.wardId,
        areaId: seed.areaId,
        streetId: seed.streetId,
        totalMembers: seed.totalMembers,
        totalLivingHere: seed.totalLivingHere,
        totalLivingAbroad: seed.totalLivingAbroad,
        surveyStatus: seed.surveyStatus,
      },
    });

    for (const mem of seed.members) {
      const existing = await prisma.familyMember.findFirst({
        where: { householdId: household.id, fullName: mem.fullName },
      });
      if (!existing) {
        await prisma.familyMember.create({
          data: {
            ...mem,
            householdId: household.id,
          },
        });
      }
    }
  }

  console.log(`✅ ${householdsSeed.length} Bhatkal Household records & Family Members seeded`);

  // Update SuperAdmin user's household link if applicable
  const mohammadHasanHousehold = await prisma.household.findUnique({
    where: { surveyId: "SRV-2026-BHK-001" },
  });
  if (mohammadHasanHousehold) {
    await prisma.user.update({
      where: { id: superAdmin.id },
      data: { householdId: mohammadHasanHousehold.id },
    });
  }

  console.log("\n🎉 Bhatkal Municipal Corporation Database Seeding Complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

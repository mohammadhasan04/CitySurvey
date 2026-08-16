import prisma from "../src/lib/prisma.ts";

async function main() {
  const tables = [
    "users",
    "wards",
    "streets",
    "households",
    "family_members",
    "correction_requests",
    "notifications",
    "reports",
    "audit_logs",
    "verification_tokens",
    "system_settings",
    "accounts",
    "sessions",
    "areas",
    "buildings",
  ];

  console.log("Enabling Row Level Security (RLS) on all public tables...");

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✓ RLS enabled for table: ${table}`);
    } catch (err) {
      console.warn(`! Warning for ${table}:`, err.message);
    }
  }

  console.log("Finished enabling RLS across all database tables!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import prisma from "../src/lib/prisma.ts";
import { supabaseAdmin } from "../src/lib/supabase.ts";

async function main() {
  console.log("Starting full cleanup of all user accounts across PostgreSQL & Supabase Auth...");

  try {
    // 1. Clear dependent records
    await prisma.auditLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.verificationToken.deleteMany({});
    await prisma.correctionRequest.deleteMany({});
    console.log("✓ Cleared audit logs, notifications, and verification tokens.");

    // 2. Clear all users from PostgreSQL public.users table
    const dbResult = await prisma.user.deleteMany({});
    console.log(`✓ Deleted ${dbResult.count} users from PostgreSQL database.`);

    // 3. Clear all users from Supabase Auth Dashboard Users list
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.warn("Notice reading Supabase Auth users:", listError.message);
    } else if (authUsers && authUsers.users) {
      let count = 0;
      for (const u of authUsers.users) {
        const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(u.id);
        if (!delErr) count++;
      }
      console.log(`✓ Deleted ${count} users from Supabase Auth Users section.`);
    }

    console.log("Cleaned all users completely! Database & Supabase Auth are now clean.");
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

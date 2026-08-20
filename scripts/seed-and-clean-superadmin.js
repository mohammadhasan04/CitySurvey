import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import prisma from "../src/lib/prisma.ts";
import { supabaseAdmin } from "../src/lib/supabase.ts";
import bcrypt from "bcryptjs";

async function main() {
  const superAdminEmail = "mohammadhasan16114@gmail.com".toLowerCase().trim();
  const superAdminPassword = "Hasan2004@";
  const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

  console.log(`Setting up single Super Admin (${superAdminEmail})...`);

  // Upsert Super Admin in PostgreSQL
  const superAdminUser = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      name: "Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      emailVerified: new Date(),
      deletedAt: null,
    },
    create: {
      email: superAdminEmail,
      name: "Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      emailVerified: new Date(),
    },
  });

  console.log(`✓ Super Admin upserted in PostgreSQL database (ID: ${superAdminUser.id})`);

  // Delete all other users from PostgreSQL
  const nonAdminUsers = await prisma.user.findMany({
    where: {
      id: { not: superAdminUser.id },
    },
    select: { id: true, email: true },
  });

  for (const u of nonAdminUsers) {
    await prisma.auditLog.deleteMany({ where: { userId: u.id } });
    await prisma.notification.deleteMany({ where: { userId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
    console.log(`✓ Deleted user ${u.email} from PostgreSQL database.`);
  }

  // Sync / Upsert Super Admin in Supabase Auth & delete all other Auth users
  try {
    const { data: authUsers, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      console.warn("Supabase Auth listUsers notice:", listErr.message);
    } else if (authUsers && authUsers.users) {
      let superAdminFound = false;

      for (const authUser of authUsers.users) {
        if (authUser.email?.toLowerCase().trim() === superAdminEmail) {
          superAdminFound = true;
          await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
            password: superAdminPassword,
            email_confirm: true,
            user_metadata: { name: "Super Admin", role: "SUPER_ADMIN" },
          });
          console.log(`✓ Updated Super Admin password & metadata in Supabase Auth section.`);
        } else {
          await supabaseAdmin.auth.admin.deleteUser(authUser.id);
          console.log(`✓ Deleted user ${authUser.email} from Supabase Auth section.`);
        }
      }

      if (!superAdminFound) {
        await supabaseAdmin.auth.admin.createUser({
          email: superAdminEmail,
          password: superAdminPassword,
          email_confirm: true,
          user_metadata: { name: "Super Admin", role: "SUPER_ADMIN" },
        });
        console.log(`✓ Created Super Admin account in Supabase Auth section.`);
      }
    }
  } catch (err) {
    console.warn("Supabase Auth cleanup notice:", err.message);
  }

  console.log("\n🎉 CLEANUP COMPLETE! Only Super Admin remains active in the system.");
}

main()
  .catch((e) => {
    console.error("Execution error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

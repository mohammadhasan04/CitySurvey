import prisma from "../src/lib/prisma.ts";
import { supabaseAdmin } from "../src/lib/supabase.ts";

async function main() {
  const superAdminEmail = (process.env.SEED_ADMIN_EMAIL || "mohammadhasan16114@gmail.com").toLowerCase().trim();

  console.log(`Preserving Super Admin: ${superAdminEmail}`);
  console.log("Removing all other users from PostgreSQL database...");

  // Find all non-Super Admin users in PostgreSQL
  const usersToDelete = await prisma.user.findMany({
    where: {
      email: {
        not: superAdminEmail,
      },
      role: {
        not: "SUPER_ADMIN",
      },
    },
    select: { id: true, email: true },
  });

  for (const u of usersToDelete) {
    await prisma.auditLog.deleteMany({ where: { userId: u.id } });
    await prisma.notification.deleteMany({ where: { userId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
    console.log(`✓ Deleted user ${u.email} from PostgreSQL database.`);
  }

  // Delete all non-Super Admin users from Supabase Auth Dashboard
  try {
    const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      console.warn("Supabase Auth listUsers notice:", error.message);
    } else if (authUsers && authUsers.users) {
      for (const authUser of authUsers.users) {
        if (authUser.email && authUser.email.toLowerCase().trim() !== superAdminEmail) {
          await supabaseAdmin.auth.admin.deleteUser(authUser.id);
          console.log(`✓ Deleted user ${authUser.email} from Supabase Auth section.`);
        }
      }
    }
  } catch (err) {
    console.warn("Supabase Auth deletion exception:", err.message);
  }

  console.log("\nCleanup Complete! All users deleted except Super Admin.");
}

main()
  .catch((e) => {
    console.error("Cleanup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

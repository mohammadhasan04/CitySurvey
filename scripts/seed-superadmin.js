import prisma from "../src/lib/prisma.ts";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../src/lib/supabase.ts";

async function main() {
  const email = "mohammadhasan16114@gmail.com";
  const rawPassword = "Hasan2004@";
  const name = "Mohammad Hasan";

  console.log(`Seeding Super Admin account (${email})...`);

  const hashedPassword = await bcrypt.hash(rawPassword, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      emailVerified: new Date(),
    },
    create: {
      email,
      name,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      emailVerified: new Date(),
    },
  });

  console.log(`✓ Super Admin created in PostgreSQL (ID: ${user.id})`);

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: rawPassword,
      email_confirm: true,
      user_metadata: { name, role: "SUPER_ADMIN" },
    });
    if (error) {
      console.log("Supabase Auth notice:", error.message);
    } else {
      console.log("✓ Super Admin created in Supabase Auth section.");
    }
  } catch (err) {
    console.warn("Supabase Auth sync notice:", err.message);
  }

  console.log("Super Admin seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

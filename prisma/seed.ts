import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  console.log("Loading seed data...");
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@gmail.com" },
    update: {},
    create: {
      email: "superadmin@gmail.com",
      passwordHash: hashedPassword,
      role: Role.SUPER_ADMIN,
      firstName: "super",
      lastName: "admin",
      schoolId: null,
    },
  });
  console.log("Super Admin created:", superAdmin.email);
  console.log("Seed data created successfully.");
}
main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

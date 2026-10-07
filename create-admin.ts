import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const name = "Admin";
  const email = "admin@gmail.com";
  const password = "Admin123456";

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingAdmin) {
    console.log("❌ Cet email existe déjà.");

    return;
  }

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword, /*password is Admin123456*/
      role: "ADMIN",
    },
  });

  console.log("✅ Administrateur créé !");
  console.log("ID :", admin.id);
  console.log("Nom :", admin.name);
  console.log("Email :", admin.email);
  console.log("Role :", admin.role);
}

main()
  .catch((error) => {
    console.error("❌ Erreur :", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
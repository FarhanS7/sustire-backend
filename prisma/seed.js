// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.log("Skip admin seed: ADMIN_EMAIL/ADMIN_PASSWORD missing");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, passwordHash, role: "ADMIN" },
  });
  console.log("Admin user ready:", admin.email);

  // Sample products
  const products = [
    {
      name: "AirFlex Runner",
      slug: "airflex-runner",
      description: "Lightweight running shoe with breathable mesh.",
      priceCents: 6999,
      imageUrl: "https://picsum.photos/seed/airflex/800/600",
      sizes: ["6", "7", "8", "9", "10", "11"],
      qtyInStock: 50,
    },
    {
      name: "StreetPro Classic",
      slug: "streetpro-classic",
      description: "Everyday sneaker with durable rubber sole.",
      priceCents: 5499,
      imageUrl: "https://picsum.photos/seed/streetpro/800/600",
      sizes: ["6", "7", "8", "9", "10"],
      qtyInStock: 40,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log("Seeded sample products");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

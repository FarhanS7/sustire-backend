// src/scripts/deleteProducts.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Delete all order items first to avoid FK constraints
  await prisma.orderItem.deleteMany({});

  // Then delete all products
  const deleted = await prisma.product.deleteMany({});
  console.log(`Deleted ${deleted.count} products.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

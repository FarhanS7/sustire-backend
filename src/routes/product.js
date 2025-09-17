const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
  });
  res.json(products);
});

// GET single product by slug
// router.get("/:slug", async (req, res) => {
//   const product = await prisma.product.findUnique({
//     where: { slug: req.params.slug },
//   });
//   if (!product) return res.status(404).json({ error: "Product not found" });
//   res.json(product);
// });

// GET single product by slug

router.get("/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { sizes: true }, // ✅ include sizes
  });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

module.exports = router;

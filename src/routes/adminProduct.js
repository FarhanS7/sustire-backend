// const express = require("express");
// const { PrismaClient } = require("@prisma/client");
// const { authMiddleware, adminOnly } = require("../middleware/auth");
// const { z } = require("zod");

// const prisma = new PrismaClient();
// const router = express.Router();

// const productSchema = z.object({
//   name: z.string(),
//   slug: z.string(),
//   description: z.string(),
//   priceCents: z.number().min(0),
//   imageUrl: z.string(),
//   isActive: z.boolean().optional(),
//   sizes: z.array(
//     z.object({
//       size: z.string(),
//       qtyInStock: z.number().min(0),
//     })
//   ),
// });

// // All routes protected by admin middleware
// router.use(authMiddleware, adminOnly);

// // CREATE product
// // POST /admin/products
// router.post("/", async (req, res) => {
//   try {
//     const data = productSchema.parse(req.body);

//     const product = await prisma.product.create({
//       data: {
//         name: data.name,
//         slug: data.slug,
//         description: data.description,
//         priceCents: data.priceCents,
//         imageUrl: data.imageUrl,
//         isActive: data.isActive ?? true,
//         sizes: {
//           create: data.sizes.map((s) => ({
//             size: s.size,
//             qtyInStock: s.qtyInStock,
//           })),
//         },
//       },
//       include: { sizes: true },
//     });

//     res.json(product);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // UPDATE product
// // PUT /admin/products/:id
// router.put("/:id", async (req, res) => {
//   try {
//     const id = parseInt(req.params.id);
//     const data = productSchema.parse(req.body);

//     const product = await prisma.product.update({
//       where: { id },
//       data: {
//         name: data.name,
//         slug: data.slug,
//         description: data.description,
//         priceCents: data.priceCents,
//         imageUrl: data.imageUrl,
//         isActive: data.isActive,
//         sizes: {
//           deleteMany: {}, // clear all old
//           create: data.sizes.map((s) => ({
//             size: s.size,
//             qtyInStock: s.qtyInStock,
//           })),
//         },
//       },
//       include: { sizes: true },
//     });

//     res.json(product);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // DELETE product
// // DELETE product
// router.delete("/:id", async (req, res) => {
//   try {
//     const productId = parseInt(req.params.id);

//     // Delete related product sizes
//     await prisma.productSize.deleteMany({
//       where: { productId },
//     });

//     // Optionally: delete order items too
//     await prisma.orderItem.deleteMany({
//       where: { productId },
//     });

//     // Now delete the product
//     await prisma.product.delete({
//       where: { id: productId },
//     });

//     res.json({ success: true });
//   } catch (err) {
//     console.error("Delete product failed:", err);
//     res.status(400).json({ error: err.message });
//   }
// });

// // GET all products (admin)
// router.get("/", async (req, res) => {
//   const products = await prisma.product.findMany();
//   res.json(products);
// });

// module.exports = router;

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware, adminOnly } = require("../middleware/auth");
const { z } = require("zod");

const prisma = new PrismaClient();
const router = express.Router();

const productSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  priceCents: z.number().min(0),
  imageUrl: z.string(),
  isActive: z.boolean().optional(),
  sizes: z.array(
    z.object({
      size: z.string(),
      qtyInStock: z.number().min(0),
    })
  ),
});

// All routes protected by admin middleware
router.use(authMiddleware, adminOnly);

// CREATE product
router.post("/", async (req, res) => {
  try {
    const data = productSchema.parse(req.body);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        priceCents: data.priceCents,
        imageUrl: data.imageUrl,
        isActive: data.isActive ?? true,
        sizes: {
          create: data.sizes.map((s) => ({
            size: s.size,
            qtyInStock: s.qtyInStock,
          })),
        },
      },
      include: { sizes: true },
    });

    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE product
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = productSchema.parse(req.body);

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        priceCents: data.priceCents,
        imageUrl: data.imageUrl,
        isActive: data.isActive ?? true,
        sizes: {
          deleteMany: { productId: id }, // only delete this product’s sizes
          create: data.sizes.map((s) => ({
            size: s.size,
            qtyInStock: s.qtyInStock,
          })),
        },
      },
      include: { sizes: true },
    });

    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    // Delete related product sizes
    await prisma.productSize.deleteMany({
      where: { productId },
    });

    // Optionally: delete order items too
    await prisma.orderItem.deleteMany({
      where: { productId },
    });

    // Now delete the product
    await prisma.product.delete({
      where: { id: productId },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Delete product failed:", err);
    res.status(400).json({ error: err.message });
  }
});

// GET all products (admin)
router.get("/", async (req, res) => {
  const products = await prisma.product.findMany({
    include: { sizes: true }, // ✅ include sizes so frontend can edit
  });
  res.json(products);
});

module.exports = router;

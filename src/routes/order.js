// src/routes/order.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const prisma = new PrismaClient();
const router = express.Router();

// Checkout schema
const checkoutSchema = z.object({
  userId: z.number().optional(), // guest allowed
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
  postalCode: z.string(),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number().min(1),
      size: z.string().nullable().optional(),
    })
  ),
});

// POST /api/orders/checkout
router.post("/checkout", async (req, res) => {
  try {
    const data = checkoutSchema.parse(req.body);

    let totalCents = 0;
    let userId = null;

    // Validate user if provided
    if (data.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: data.userId },
      });
      if (userExists) userId = data.userId;
    }

    // Validate products & stock
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return res
          .status(400)
          .json({ error: `Product ${item.productId} not found` });
      }

      if (item.size) {
        const sizeRow = await prisma.productSize.findFirst({
          where: { productId: item.productId, size: item.size },
        });
        if (!sizeRow) {
          return res.status(400).json({
            error: `Size ${item.size} not available for ${product.name}`,
          });
        }
        if (sizeRow.qtyInStock < item.quantity) {
          return res.status(400).json({
            error: `${product.name} (size ${item.size}) is out of stock`,
          });
        }
      }

      totalCents += product.priceCents * item.quantity;
    }

    // 1️⃣ Create order WITHOUT items
    const order = await prisma.order.create({
      data: {
        userId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode,
        totalCents,
      },
    });

    // 2️⃣ Create order items separately with priceCents
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          size: item.size || null,
          priceCents: product.priceCents,
        },
      });

      // Decrement stock if size exists
      if (item.size) {
        await prisma.productSize.updateMany({
          where: { productId: item.productId, size: item.size },
          data: { qtyInStock: { decrement: item.quantity } },
        });
      }
    }

    // 3️⃣ Return full order with items & product details
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: true } } },
    });

    res.json(fullOrder);
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

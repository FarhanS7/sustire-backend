const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

// Protect all routes
router.use(authMiddleware, adminOnly);

// GET all orders with customer info and items
router.get("/", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, priceCents: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single order details
router.get("/:id", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, priceCents: true } },
          },
        },
      },
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

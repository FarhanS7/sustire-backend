const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

// Protect all routes
router.use(authMiddleware, adminOnly);

// GET dashboard summary
router.get("/", async (req, res) => {
  try {
    // Total orders
    const totalOrders = await prisma.order.count();

    // Total sales
    const totalSalesData = await prisma.order.aggregate({
      _sum: { totalCents: true },
    });
    const totalSales = totalSalesData._sum.totalCents || 0;

    // Top 5 customers by number of orders
    const topCustomers = await prisma.user.findMany({
      orderBy: { orders: { _count: "desc" } },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        orders: { select: { id: true } },
      },
    });

    res.json({ totalOrders, totalSales, topCustomers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

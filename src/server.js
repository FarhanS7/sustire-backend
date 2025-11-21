require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const adminProductRoutes = require("./routes/adminProduct");
const adminOrderRoutes = require("./routes/adminOrder");
const adminDashboardRouter = require("./routes/adminDashboard");

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [process.env.FRONTEND_ORIGIN, "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Server is healthy" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/admin/products", adminProductRoutes);
app.use("/admin/orders", adminOrderRoutes);
app.use("/admin/dashboard", adminDashboardRouter);

// Fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = app;

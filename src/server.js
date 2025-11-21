// require("dotenv").config();
// const express = require("express");
// const morgan = require("morgan");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");

// const authRoutes = require("./routes/auth");
// const productRoutes = require("./routes/product");
// const orderRoutes = require("./routes/order");
// const adminProductRoutes = require("./routes/adminProduct");
// const adminOrderRoutes = require("./routes/adminOrder");
// const adminDashboardRouter = require("./routes/adminDashboard");
// const app = express();

// // middleware
// app.use(morgan("dev"));
// app.use(express.json());
// app.use(cookieParser());
// const allowedOrigins = [
//   process.env.FRONTEND_ORIGIN, // e.g. https://sus-tire.vercel.app
//   "http://localhost:3000", // local dev frontend
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps or curl)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// // health check
// app.get("/api/health", (req, res) => {
//   res.json({ ok: true, message: "Server is healthy" });
// });

// // routes
// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/admin/products", adminProductRoutes);
// app.use("/api/admin/orders", adminOrderRoutes);
// app.use("/api/admin/dashboard", adminDashboardRouter);

// // fallback
// app.use((req, res) => {
//   res.status(404).json({ error: "Not found" });
// });
// src/server.js
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
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is healthy" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/dashboard", adminDashboardRouter);

// Fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// **DO NOT listen here**
module.exports = app;

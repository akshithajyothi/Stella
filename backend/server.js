// backend/server.js
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
require("./db"); // opens + seeds backend/data/restyle.db on first run
const ordersRouter = require("./routes/orders");
const authRouter = require("./routes/auth");
const agentRouter = require("./routes/agent");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS - adjust origin for production
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/agent", agentRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

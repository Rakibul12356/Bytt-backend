const express = require("express");
const cors = require("cors");
const { connectDB, getDB } = require("../config/db");
const userRoutes = require("../routes/users");
const courseRoutes = require("../routes/courses");

const app = express();

/* ---------------- Middleware ---------------- */
app.use(express.json());

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const allowedOrigins = clientOrigin
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
  }),
);

// Handle preflight requests explicitly
app.options("*", cors());

/* ---------------- Routes ---------------- */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);

/* ---------------- DB Connection (Safe for Vercel) ---------------- */
let isConnected = false;

async function ensureDB() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
    console.log("MongoDB connected");
  }
}

app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

/* ---------------- Export ---------------- */
module.exports = app;

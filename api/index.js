require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, getDB } = require("../config/db");
const userRoutes = require("../routes/users");
const courseRoutes = require("../routes/courses");
const enrollmentRoutes = require("../routes/enrollments");

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
app.use("/api/enrollments", enrollmentRoutes);

// Dev-only debug route to list users metadata (email, hasPassword, passwordPrefix)
if (process.env.NODE_ENV !== "production") {
  app.get("/api/debug/users", async (req, res) => {
    try {
      const db = getDB();
      const users = await db.collection("users").find().limit(100).toArray();
      const mapped = users.map((u) => ({
        _id: u._id,
        email: u.email,
        hasPassword: !!u.password,
        passwordPrefix: u.password ? String(u.password).slice(0, 10) : null,
      }));
      res.json({ users: mapped });
    } catch (err) {
      console.error("Debug users error:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
}

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

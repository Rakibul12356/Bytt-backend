require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, getDB } = require("./config/db");
const userRoutes = require("./routes/users");
const courseRoutes = require("./routes/courses");
const enrollmentRoutes = require("./routes/enrollments");

const app = express();
// Do not call listen in serverless environment (Vercel). We'll export `app` below.

// Middleware
app.use(express.json());

// Enable CORS for frontend. `CLIENT_ORIGIN` may contain a comma-separated
// list of allowed origins (e.g. "http://localhost:5173,https://my-frontend.vercel.app").
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const allowedOrigins = clientOrigin
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g., server-to-server, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"), false);
    },
    credentials: true,
  }),
);

// Simple health route to verify CORS and server availability
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Routes
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

// Export the Express app for serverless handlers (Vercel)
module.exports = app;

// Connect database and start server only when not running on Vercel
connectDB()
  .then(() => {
    if (!process.env.VERCEL) {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } else {
      console.log("Connected to DB — running as Vercel serverless function");
    }
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

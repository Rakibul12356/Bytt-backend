require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, getDB } = require("./config/db");
const userRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Enable CORS for frontend during development. Use CLIENT_ORIGIN env var to customize.
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: clientOrigin, credentials: true }));

// Simple health route to verify CORS and server availability
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Routes
app.use("/api/users", userRoutes);

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

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  createUser,
  register,
  login,
} = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

// GET all users (protected)
router.get("/", auth, getAllUsers);

// POST a new user (unprotected raw create)
router.post("/", createUser);

// Register (hashes password)
router.post("/register", register);

// Login (returns JWT)
router.post("/login", login);

module.exports = router;

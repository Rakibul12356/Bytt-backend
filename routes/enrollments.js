const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createEnrollment,
  getUserEnrollments,
  getPendingEnrollments,
  approveEnrollment,
} = require("../controllers/enrollmentController");

// Create enrollment (authenticated user)
router.post("/", auth, createEnrollment);

// Get user's approved enrollments
router.get("/user", auth, getUserEnrollments);

// Admin: list pending enrollments
router.get("/admin/pending", auth, getPendingEnrollments);

// Admin: approve enrollment
router.put("/:id/approve", auth, approveEnrollment);

module.exports = router;

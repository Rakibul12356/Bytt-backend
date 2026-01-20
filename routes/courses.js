const express = require("express");
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const auth = require("../middleware/authMiddleware");

// GET all courses (public)
router.get("/", getAllCourses);

// GET single course by ID (public)
router.get("/:id", getCourseById);

// POST new course (admin only - protected)
router.post("/", auth, createCourse);

// PUT update course (admin only - protected)
router.put("/:id", auth, updateCourse);

// DELETE course (admin only - protected)
router.delete("/:id", auth, deleteCourse);

module.exports = router;

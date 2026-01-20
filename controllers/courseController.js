const courseService = require("../services/courseService");

const getAllCourses = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createCourse = async (req, res) => {
  try {
    const course = req.body;
    const result = await courseService.createCourse(course);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateCourse = async (req, res) => {
  try {
    const result = await courseService.updateCourse(req.params.id, req.body);
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course updated successfully", result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const result = await courseService.deleteCourse(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};

const enrollmentService = require("../services/enrollmentService");

const createEnrollment = async (req, res) => {
  try {
    const userId =
      req.user && req.user._id
        ? req.user._id
        : req.user.id || req.user.sub || null;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: "Missing courseId" });
    const result = await enrollmentService.createEnrollment(userId, courseId);
    if (result && result.error)
      return res.status(400).json({ message: result.error });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserEnrollments = async (req, res) => {
  try {
    const userId =
      req.user && req.user._id
        ? req.user._id
        : req.user.id || req.user.sub || null;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const enrollments = await enrollmentService.getUserEnrollments(userId);
    res.json(enrollments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getPendingEnrollments = async (req, res) => {
  try {
    // admin only
    if (!req.user || req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });
    const pending = await enrollmentService.getPendingEnrollments();
    res.json(pending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const approveEnrollment = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });
    const id = req.params.id;
    const updated = await enrollmentService.approveEnrollment(
      id,
      req.user._id || req.user.id,
    );
    if (!updated)
      return res.status(404).json({ message: "Enrollment not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createEnrollment,
  getUserEnrollments,
  getPendingEnrollments,
  approveEnrollment,
};

const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

async function createEnrollment(userId, courseId) {
  const db = getDB();
  // prevent duplicate pending/approved enrollments
  const existing = await db
    .collection("enrollments")
    .findOne({
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId),
      status: { $in: ["pending", "approved"] },
    });
  if (existing) return { error: "Enrollment already exists" };
  const doc = {
    userId: new ObjectId(userId),
    courseId: new ObjectId(courseId),
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await db.collection("enrollments").insertOne(doc);
  doc._id = result.insertedId;
  return doc;
}

async function getUserEnrollments(userId) {
  const db = getDB();
  const enrollments = await db
    .collection("enrollments")
    .aggregate([
      { $match: { userId: new ObjectId(userId), status: "approved" } },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
      { $project: { status: 1, createdAt: 1, course: 1 } },
    ])
    .toArray();
  return enrollments;
}

async function getPendingEnrollments() {
  const db = getDB();
  const pending = await db
    .collection("enrollments")
    .aggregate([
      { $match: { status: "pending" } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          status: 1,
          createdAt: 1,
          user: { _id: 1, name: 1, email: 1 },
          course: { _id: 1, title: 1, name: 1 },
        },
      },
    ])
    .toArray();
  return pending;
}

async function approveEnrollment(enrollmentId, adminId) {
  const db = getDB();
  const res = await db
    .collection("enrollments")
    .findOneAndUpdate(
      { _id: new ObjectId(enrollmentId) },
      {
        $set: {
          status: "approved",
          approvedAt: new Date(),
          approver: new ObjectId(adminId),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );
  return res.value;
}

module.exports = {
  createEnrollment,
  getUserEnrollments,
  getPendingEnrollments,
  approveEnrollment,
};

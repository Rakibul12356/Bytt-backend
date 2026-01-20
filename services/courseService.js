const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const getAllCourses = async () => {
  const db = getDB();
  return await db.collection("courses").find().toArray();
};

const getCourseById = async (id) => {
  const db = getDB();
  return await db.collection("courses").findOne({ _id: new ObjectId(id) });
};

const createCourse = async (courseData) => {
  const db = getDB();
  const course = {
    ...courseData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await db.collection("courses").insertOne(course);
  return { ...course, _id: result.insertedId };
};

const updateCourse = async (id, courseData) => {
  const db = getDB();
  const updateData = {
    ...courseData,
    updatedAt: new Date(),
  };
  return await db
    .collection("courses")
    .updateOne({ _id: new ObjectId(id) }, { $set: updateData });
};

const deleteCourse = async (id) => {
  const db = getDB();
  return await db.collection("courses").deleteOne({ _id: new ObjectId(id) });
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};

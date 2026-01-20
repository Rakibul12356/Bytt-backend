require("dotenv").config();
const { connectDB, getDB } = require("../config/db");


async function importCourses() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    const db = getDB();
    const coursesCollection = db.collection("courses");

    // Clear existing courses (optional)
    const deleteResult = await coursesCollection.deleteMany({});
    console.log(` Deleted ${deleteResult.deletedCount} existing courses`);

    // Insert new courses
    const result = await coursesCollection.insertMany(coursesData);
    console.log(` Inserted ${result.insertedCount} courses successfully!`);

    // Display inserted courses
    const allCourses = await coursesCollection.find().toArray();
    console.log("\n📚 Courses in database:");
    allCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name} - ${course.price} BDT`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing courses:", error);
    process.exit(1);
  }
}

importCourses();

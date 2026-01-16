/**
 * One-time professional role-fix script
 * - Sets missing `role` on users to `student`
 * - Ensures an admin user exists with provided email/password (defaults provided)
 *
 * Usage:
 *   node Bytt-backend/scripts/addRoles.js --email=admi@gmail.com --password=admin12345
 * Or rely on .env MONGO_URI and DB_NAME in Bytt-backend/.env
 */

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  args.forEach((a) => {
    const m = a.match(/^--([^=]+)=(.+)$/);
    if (m) out[m[1]] = m[2];
  });
  return out;
}

function readDotEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf8");
  return content
    .split(/\r?\n/)
    .filter(Boolean)
    .reduce((acc, line) => {
      if (line.trim().startsWith("#")) return acc;
      const idx = line.indexOf("=");
      if (idx === -1) return acc;
      const k = line.slice(0, idx).trim();
      let v = line.slice(idx + 1).trim();
      // remove surrounding quotes
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      )
        v = v.slice(1, -1);
      acc[k] = v;
      return acc;
    }, {});
}

(async () => {
  try {
    const args = parseArgs();
    const env = readDotEnv(path.join(__dirname, "..", ".env"));
    const mongoUri =
      env.MONGO_URI || process.env.MONGO_URI || "mongodb://localhost:27017";
    const dbName = env.DB_NAME || process.env.DB_NAME || "mydatabase";
    const adminEmail = args.email || env.ADMIN_EMAIL || "admi@gmail.com";
    const adminPass = args.password || env.ADMIN_PASSWORD || "admin12345";

    console.log("Connecting to MongoDB", mongoUri, "db:", dbName);
    // modern mongodb driver no longer accepts useNewUrlParser/useUnifiedTopology
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db(dbName);

    // 1) Set missing roles to 'student'
    const res1 = await db
      .collection("users")
      .updateMany(
        { $or: [{ role: { $exists: false } }, { role: null }] },
        { $set: { role: "student" } }
      );
    console.log("Users updated (missing role -> student):", res1.modifiedCount);

    // 2) Ensure admin user exists and has role 'admin'
    const existing = await db
      .collection("users")
      .findOne({ email: adminEmail });
    const hashed = await bcrypt.hash(adminPass, 10);
    if (existing) {
      const updateRes = await db
        .collection("users")
        .updateOne(
          { _id: existing._id },
          { $set: { role: "admin", password: hashed } }
        );
      console.log(
        "Admin user updated:",
        adminEmail,
        "modified:",
        updateRes.modifiedCount
      );
    } else {
      const adminDoc = {
        name: "Admin",
        email: adminEmail,
        password: hashed,
        role: "admin",
        createdAt: new Date(),
      };
      const insertRes = await db.collection("users").insertOne(adminDoc);
      console.log(
        "Admin user created:",
        adminEmail,
        "id:",
        insertRes.insertedId
      );
    }

    await client.close();
    console.log("Done.");
    process.exit(0);
  } catch (err) {
    console.error("Error in addRoles script:", err);
    process.exit(1);
  }
})();

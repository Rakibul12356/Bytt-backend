const { getDB } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getAllUsers = async () => {
  const db = getDB();
  const users = await db.collection("users").find().toArray();
  // remove password before returning
  return users.map(({ password, ...rest }) => rest);
};

const createUser = async (userData) => {
  const db = getDB();
  return await db.collection("users").insertOne(userData);
};

const register = async ({ name, email, password }) => {
  const db = getDB();
  const existing = await db.collection("users").findOne({ email });
  if (existing) throw new Error("User already exists");
  const hashed = await bcrypt.hash(password, 10);
  const user = { name, email, password: hashed, createdAt: new Date() };
  const result = await db.collection("users").insertOne(user);
  user._id = result.insertedId;
  delete user.password;
  return user;
};

const authenticate = async ({ email, password }) => {
  const db = getDB();
  const user = await db.collection("users").findOne({ email });
  console.log(
    "authenticate: found user?",
    !!user,
    "email:",
    email,
    "hasPassword:",
    !!(user && user.password)
  );
  if (!user) return null;
  if (!user.password) {
    console.warn(
      "authenticate: user has no password field, cannot verify password",
      email
    );
    return null;
  }
  // Log a small prefix and whether it looks like a bcrypt hash for debugging
  try {
    console.log(
      "stored password prefix:",
      typeof user.password === "string"
        ? String(user.password).slice(0, 8)
        : typeof user.password
    );
    console.log(
      "password looks like bcrypt:",
      typeof user.password === "string" && user.password.startsWith("$2")
    );
  } catch (e) {
    console.error("Error inspecting stored password for", email, e);
  }
  let match = false;
  try {
    match = await bcrypt.compare(password, user.password);
    console.log("bcrypt compare result:", match, "for email:", email);
  } catch (e) {
    console.error("bcrypt compare error for", email, e);
    return null;
  }
  if (!match) {
    console.log("Password mismatch for:", email);
    return null;
  }
  console.log("Password matched! Generating JWT...");
  // Provide a development fallback for JWT secret to avoid 500s during local testing.
  // Default to dev mode if NODE_ENV is not set
  const isProduction = process.env.NODE_ENV === "production";
  const secret =
    process.env.JWT_SECRET || (isProduction ? null : "dev_jwt_secret");
  if (!secret) throw new Error("JWT_SECRET not set in .env");
  const token = jwt.sign({ userId: user._id, email: user.email }, secret, {
    expiresIn: "1h",
  });
  const safeUser = { ...user };
  delete safeUser.password;
  return { user: safeUser, token };
};

module.exports = { getAllUsers, createUser, register, authenticate };

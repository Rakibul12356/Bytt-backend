const userService = require("../services/userService");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createUser = async (req, res) => {
  try {
    const user = req.body;
    const result = await userService.createUser(user);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const register = async (req, res) => {
  try {
    const newUser = await userService.register(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    if (err.message === "User already exists")
      return res.status(400).json({ message: err.message });
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    console.log("Login request body:", req.body);
    const auth = await userService.authenticate(req.body);
    if (!auth) return res.status(401).json({ message: "Invalid credentials" });
    res.json(auth);
  } catch (err) {
    console.error("Login error (backend):", err && err.stack ? err.stack : err);
    if (err.message && err.message.includes("JWT_SECRET"))
      return res.status(500).json({ message: err.message });
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllUsers, createUser, register, login };

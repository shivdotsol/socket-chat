import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = await User.create({ name, email, password });
    res
      .status(201)
      .json({
        token: generateToken(user._id),
        email: user.email,
        name: user.name,
      });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      token: generateToken(user._id),
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

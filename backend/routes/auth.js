// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function toSafeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existing = User.findByEmail(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = User.create({ name, email: email.toLowerCase(), password: hashed });

    const token = signToken(user);
    setAuthCookie(res, token);
    res.status(201).json({ user: toSafeUser(user) });
  } catch (err) {
    console.error("Register failed:", err);
    res.status(500).json({ message: "Failed to create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = User.findByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ user: toSafeUser(user) });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ message: "Failed to log in" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: toSafeUser(req.user) });
});

router.put("/me", requireAuth, (req, res) => {
  try {
    const { name, bio, city } = req.body;
    const fields = {};
    if (name !== undefined) fields.name = name;
    if (bio !== undefined) fields.bio = bio;
    if (city !== undefined) fields.city = city;
    const user = User.update(req.user.id, fields);
    res.json({ user: toSafeUser(user) });
  } catch (err) {
    console.error("Profile update failed:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// Register route
// router.post("/register", async (req, res) => {
//   const { name, email, password, role, department } = req.body;

//   try {
//     // Check if the user already exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ error: "User already exists" });
//     }

//     // Validate role
//     const validRoles = ["Admin", "Manager", "User"];
//     if (!validRoles.includes(role)) {
//       return res.status(400).json({ error: "Invalid role" });
//     }

//     // Create new user with plain text password
//     const newUser = new User({
//       name,
//       email,
//       password, // Store password directly
//       role,
//       department,
//     });

//     await newUser.save();

//     // Create JWT payload
//     const payload = {
//       id: newUser.id,
//       name: newUser.name,
//       email: newUser.email,
//       role: newUser.role,
//       department: newUser.department,
//     };

//     // Generate JWT token
//     const token = jwt.sign(payload, process.env.JWT_SECRET || "jwtSecret", {
//       expiresIn: "1h",
//     });

//     res.status(201).json({ token, user: payload });
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

const mongoose = require("mongoose");

// Register route
router.post("/register", async (req, res) => {
  const { name, email, password, role, department } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Validate role
    const validRoles = ["Admin", "Manager", "User"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Validate and convert department if provided
    let departmentId = undefined;
    if (department) {
      if (mongoose.Types.ObjectId.isValid(department)) {
        departmentId = new mongoose.Types.ObjectId(department);
      } else {
        return res.status(400).json({ error: "Invalid department ID" });
      }
    }


    // Create new user
    const newUser = new User({
      name,
      email,
      password: password,
      role,
      ...(departmentId && { department: departmentId }),
    });

    await newUser.save();

    // JWT payload
    const payload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET || "jwtSecret", {
      expiresIn: "1h",
    });

    res.status(201).json({ token, user: payload });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
});



// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password directly
    if (password !== user.password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Create JWT payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET || "jwtSecret", {
      expiresIn: "1h",
    });

    res.json({ token, user: payload });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Protected route to get user data
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
import express from "express";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import Users from "../../model/AllUserSchema.js";

const router = express.Router();

// 🔒 Basic rate limit to prevent abuse (tune as needed)
const signupLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20,             // 20 req/min/IP
});

router.post("/shopkeeper-signup", signupLimiter, async (req, res) => {
  try {
    let { username, email, password, phone } = req.body;


    username = username?.trim();
    email = email?.trim().toLowerCase();
    phone = phone?.trim();

    if (!username || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }
    if (username.length < 2 || username.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Username must be 2–50 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit phone number",
      });
    }

    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must be 6–128 characters",
      });
    }


    const saltRounds = 10; // can increase to 12 if CPU allows
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newShopkeeper = await Users.create({
      username,
      email,
      phone,
      password: passwordHash,
      role: "shopkeeper",
    });

    return res.status(201).json({
      success: true,
      message: "Shopkeeper registered successfully. Please login.",
      userId: newShopkeeper._id, 
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User already exists!",
      });
    }

    console.error("Signup error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
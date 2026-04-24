import express from "express";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import Users from "../../model/AllUserSchema.js";

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});

router.post("/customer-signup", limiter, async (req, res) => {
  try {
    let { username, email, password, phone, shopkeeperId } = req.body;

    username = username?.trim();
    email = email?.trim().toLowerCase();
    phone = phone?.trim();

    if (!username || !email || !password || !phone || !shopkeeperId) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(shopkeeperId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid shopkeeperId" });
    }

    if (username.length < 2 || username.length > 50) {
      return res.status(400).json({ success: false, message: "Invalid username" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ success: false, message: "Invalid password length" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newCustomer = await Users.create({
      username,
      email,
      phone,
      password: passwordHash,
      role: "customer",
      shopkeeperId,
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully!",
      userId: newCustomer._id,
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "User already exists!" });
    }

    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
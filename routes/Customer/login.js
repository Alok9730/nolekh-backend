import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Users from "../../model/AllUserSchema.js";

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
});

router.post("/login", limiter, async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const user = await Users.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        shopkeeperId: user.shopkeeperId || null,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "User login successfully",
      token,
      userId: user._id,
      role: user.role,
      customerName: user.username,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
import express from "express";
import bcrypt from "bcrypt";
import Users from "../../model/AllUserSchema.js";

const router = express.Router();

router.post("/CustomerSignup", async (req, res) => {//CustomerSignup
  const { username, email, password, phone,shopkeeperId } = req.body;

  try {
    if (!username || !email || !password || !phone || !shopkeeperId) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const exist = await Users.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newShopkeeper = new Users({
      username,
      email,
      phone,
      password: passwordHash,
      role: "customer",
      shopkeeperId: shopkeeperId,
    });

    await newShopkeeper.save();

    res.status(201).json({ message: "Customer registered successfully!" });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

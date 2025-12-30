import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Users from "../../model/AllUserSchema.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(404).json({ message: "Fill the info Perfectly!!" });
    const exist = await Users.findOne({ email });
    if (!exist) return res.status(404).json({ message: "User not exist!" });
    const passwordCheck = await bcrypt.compare(password, exist.password);
    if (!passwordCheck)
      return res.status(404).json({ message: "password incorrectly!!" });
   
    const token = jwt.sign(
      {
        shopId: exist._id.toString(),
        role: exist.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({ message: "user login successfully", token ,userId:exist._id,role:exist.role});
  } catch (err) {
    console.log(err.message);
  }
});

export default router;

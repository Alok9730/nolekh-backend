import express from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import adminUser from "../../model/AllUserSchema.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(404).json({ message: "Fill the info Perfectly!!" });
    const exist = await adminUser.findOne({ email });
    if (!exist) return res.status(404).json({ message: "User not exist!" });
    const passwordChecking = await bcrypt.compare(password, exist.password);
    if (!passwordChecking)
      return res.status(400).json({ message: "Password incorrect!" });


    const token = jwt.sign({
      id:exist._id,
      role:exist.role,
      shopkeeperId:exist.shopkeeperId,
    },
    
    process.env.JWT_SECRET,
    {expiresIn:process.env.JWT_EXPIRE}
  )
      
    res.status(201).json({message:"user login successfully",token ,userId:exist._id,role:exist.role,CustomerName:exist.username})
  } catch (err) {
    console.log(err.message);
  }
});

export default router;

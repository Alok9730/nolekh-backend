import express from "express";
import UserSchema from "../../model/AllUserSchema.js";

const router = express.Router();

router.delete("/customerDelete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const Exist = await UserSchema.findByIdAndDelete(id);

    if (!Exist) return res.status(400).json({ message: "User not exist" });

    res.status(201).json({ message: "User deleted Successfully!!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

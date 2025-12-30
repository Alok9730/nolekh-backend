import express from "express";
import mongoose from "mongoose";
import user from "../../model/AllUserSchema.js";

const router = express.Router();

router.put("/renameCustomer", async (req, res) => {
  try {
    const { id, newName } = req.body;

    const Customer = await user.findOneAndUpdate(
      { _id: id, role: "customer" },
      { $set: { username: newName } },
      { new: true }
    );

    if (!Customer) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    res
      .status(200)
      .json({ message: "Rename Successfully!!", updateName: Customer });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;

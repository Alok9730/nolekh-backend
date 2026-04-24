import express from "express";
import mongoose from "mongoose";
import Users from "../../model/AllUserSchema.js";

const router = express.Router();

router.put("/customer/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    if (req.user.role !== "shopkeeper") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    if (!newName || newName.trim().length < 2) {
      return res.status(400).json({ message: "Invalid name" });
    }

    const updatedCustomer = await Users.findOneAndUpdate(
      {
        _id: id,
        shopkeeperId: req.user.shopId,
        role: "customer"
      },
      { $set: { username: newName.trim() } },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Rename successful",
      username: updatedCustomer.username
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
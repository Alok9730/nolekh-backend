import express from "express";
import mongoose from "mongoose";
import Users from "../../model/AllUserSchema.js";

const router = express.Router();

router.delete("/customer/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "shopkeeper") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const deletedUser = await Users.findOneAndDelete({
      _id: id,
      shopkeeperId: req.user.shopId,
      role: "customer",
    });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;

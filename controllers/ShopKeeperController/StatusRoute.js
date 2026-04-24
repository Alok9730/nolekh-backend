import express from "express";
import mongoose from "mongoose";
import ProductEntry from "../../model/ProductEntrySchema.js";

const router = express.Router();

router.post("/updateStatus", async (req, res) => {
  try {
    const { productEntryId, status } = req.body;

    if (req.user.role !== "shopkeeper") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!productEntryId || !status) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!["Paid", "Unpaid"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (!mongoose.Types.ObjectId.isValid(productEntryId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const entryId = new mongoose.Types.ObjectId(productEntryId);

    const updatedEntry = await ProductEntry.findOneAndUpdate(
      {
        _id: entryId,
        shopkeeperId: req.user.shopId
      },
      { status },
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ message: "Product entry not found" });
    }

    res.status(200).json({
      message: `Marked as ${status}`,
      data: {
        id: updatedEntry._id,
        status: updatedEntry.status
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
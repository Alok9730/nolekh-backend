import express from "express";
import mongoose from "mongoose";
import ProductEntry from "../../model/ProductEntrySchema.js";

const router = express.Router();

router.post("/updateStatus", async (req, res) => {
    console.log("hitting")
  try {
    const { productEntryId, status } = req.body;

    if (!productEntryId || !status) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!["Paid", "Unpaid"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const entryId = new mongoose.Types.ObjectId(productEntryId);
    console.log(entryId)

    const updatedEntry = await ProductEntry.findByIdAndUpdate(
      entryId,
      { status },
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ message: "Product entry not found" });
    }

    res.status(200).json({
      message: `Marked as ${status}`,
      data: updatedEntry,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

import express from "express";
import mongoose from "mongoose";
import ProductEntry from "../../model/ProductEntrySchema.js";

const router = express.Router();

router.post("/FieldDeletion", async (req, res) => {
  try {
    const { productEntryId, month, itemId } = req.body;

    if (!productEntryId || !month || !itemId) {
      return res.status(400).json({ message: "All fields required" });
    }

    const parentId = new mongoose.Types.ObjectId(productEntryId);
    const itemObjectId = new mongoose.Types.ObjectId(itemId);

    // 1️⃣ Fetch parent document
    const productEntry = await ProductEntry.findOne({
      _id: parentId,
      month: month,
    });

    if (!productEntry) {
      return res.status(404).json({ message: "Product entry not found" });
    }

    // 2️⃣ Check item existence
    const itemExists = productEntry.items.some(
      (item) => item._id.toString() === itemObjectId.toString()
    );

    if (!itemExists) {
      return res.status(404).json({ message: "Item not found" });
    }

    // 3️⃣ If only one item → delete whole document
    if (productEntry.items.length === 1) {
      await ProductEntry.deleteOne({ _id: parentId });
      return res.status(200).json({
        message: "Last item deleted, product entry removed completely",
      });
    }

    // 4️⃣ Else → delete only the item
    await ProductEntry.updateOne(
      { _id: parentId },
      { $pull: { items: { _id: itemObjectId } } }
    );

    res.status(200).json({ message: "Product item deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

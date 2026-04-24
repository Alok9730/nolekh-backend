import express from "express";
import mongoose from "mongoose";
import ProductEntry from "../../model/ProductEntrySchema.js";

const router = express.Router();
router.delete("/FieldDeletion", async (req, res) => {
  try {
    const { productEntryId, month, itemId } = req.body;

    if (!productEntryId || !month || !itemId) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(productEntryId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const parentId = new mongoose.Types.ObjectId(productEntryId);
    const itemObjectId = new mongoose.Types.ObjectId(itemId);

    const productEntry = await ProductEntry.findOne({
      _id: parentId,
      month,
      shopkeeperId: req.user.shopId
    });

    if (!productEntry) {
      return res.status(404).json({ message: "Product entry not found" });
    }

    const itemExists = productEntry.items.some(
      (item) => item._id.toString() === itemObjectId.toString()
    );

    if (!itemExists) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (productEntry.items.length === 1) {
      await ProductEntry.deleteOne({ _id: parentId });
      return res.status(200).json({
        message: "Last item deleted, entry removed"
      });
    }

    await ProductEntry.updateOne(
      { _id: parentId },
      { $pull: { items: { _id: itemObjectId } } }
    );

    res.status(200).json({ message: "Item deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

import express from "express";
import ProductSchema from "../../model/ProductEntrySchema.js";
const router = express.Router();


router.post("/updateEntry", async (req, res) => {
  try {
    const { productEntryId, items } = req.body;

    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += Number(item.rate) || 0;
    });

    await ProductSchema.findByIdAndUpdate(
      productEntryId,
      {
        items,
        totalAmount,
      },
      { new: true }
    );

    res.status(200).json({ message: "Entry updated" });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

export default router;

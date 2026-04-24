import express, { response } from "express";
import ProductSchema from "../../model/ProductEntrySchema.js";
import mongoose from "mongoose";

const router = express.Router();

router.delete("/customerMonthDel", async (req, res) => {
  try {
    const { id, monthName } = req.query;
    if (!id && !monthName)
      return res.status(400).json({ message: "Not found id Or monthName" });

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Customer Id!!" });

    const result = ProductSchema.deleteMany({
      customerId: id,
      month: monthName,
      shopkeeperId: req.user.shopId,
    });

    if ((await result.deletedCount) == 0)
      return res.status(400).json({ message: "No Data Found!!" });

    res.status(200).json({
      success: true,
      message: "Month deleted successfully",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

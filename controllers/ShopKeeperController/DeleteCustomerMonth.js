import express from "express";
import ProductSchema from "../../model/ProductEntrySchema.js";

const router = express.Router();

router.delete("/customerMonthDel/:id/:monthName", async (req, res) => {
  try {
    const { id, monthName } = req.params;
    if (!id || !monthName)
      return res.status(404).json({ message: "user or month Required" });
    await ProductSchema.deleteMany({ customerId: id, month: monthName });
    res.status(200).json({ message: "Month deleted successfully" });
  } catch (err) {
    console.log(err.message);
  }
});

export default router;

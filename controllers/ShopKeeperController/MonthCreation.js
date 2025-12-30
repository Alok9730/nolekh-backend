import express from "express";
import ProductSchema from "../../model/ProductEntrySchema.js";

const router = express.Router();

router.post("/NewMonthCreation", async (req, res) => {
  try {
    const { CustomerId } = req.body;
    const shopkeeperId = req.user.shopId;

    if (!shopkeeperId || !CustomerId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const month = `${monthNames[now.getMonth()]}${now.getFullYear()}`;

    const existing = await ProductSchema.findOne({ shopkeeperId, customerId: CustomerId, month });
    if (existing) {
      return res.status(400).json({ message: "Month already exists" });
    }

    const newEntry = await ProductSchema.create({
      shopkeeperId,
      customerId: CustomerId,
      month,
      items: [],
      totalAmount: 0,
      status: "Unpaid",
    });

    res.status(201).json({ message: "New month created", data: newEntry });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;

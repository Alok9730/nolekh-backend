import express from "express";
import mongoose from "mongoose";
import ProductSchema from "../../model/ProductEntrySchema.js";

const router = express.Router();

router.post("/NewMonthCreation", async (req, res) => {
  try {
    const { CustomerId } = req.body;
    const shopkeeperId = req.user.shopId;

    if (req.user.role !== "shopkeeper") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!shopkeeperId || !CustomerId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(CustomerId)) {
      return res.status(400).json({ message: "Invalid CustomerId" });
    }

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const now = new Date();
    const month = `${monthNames[now.getMonth()]}${now.getFullYear()}`;

    const newEntry = await ProductSchema.create({
      shopkeeperId,
      customerId: CustomerId,
      month,
      items: [],
      totalAmount: 0,
      status: "Unpaid",
    });

    res.status(201).json({
      message: "New month created",
      data: {
        id: newEntry._id,
        month: newEntry.month
      }
    });

  } catch (err) {

    if (err.code === 11000) {
      return res.status(400).json({ message: "Month already exists" });
    }

    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
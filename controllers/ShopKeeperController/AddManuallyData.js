import express from "express";
import mongoose from "mongoose";
import ProductEntrySchema from "../../model/ProductEntrySchema.js";

const router = express.Router();

router.post("/ManualDataEntry", async (req, res) => {
  try {
    const { customerId, monthName, productName, Qty, Rate } = req.body;
    const shopkeeperId = req.user?.shopId;


    if (!customerId || !monthName || !productName || !Qty || !Rate) {
      return res.status(400).json({ message: "Fields missing!" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(customerId) ||
      !mongoose.Types.ObjectId.isValid(shopkeeperId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const quantityString = Qty.trim();
    const rateNumber = parseFloat(Rate);

    if (isNaN(rateNumber) || rateNumber <= 0) {
      return res.status(400).json({ message: "Invalid Rate" });
    }

    if (!quantityString) {
      return res.status(400).json({ message: "Invalid Quantity" });
    }

    const newItem = {
      productName,
      quantity: quantityString,
      rate: rateNumber,
    };

    const latestEntry = await ProductEntrySchema.findOne({
      customerId,
      shopkeeperId,
      month: monthName,
    }).sort({ updatedAt: -1 });

    let updatedEntry;

    if (!latestEntry) {

      updatedEntry = await ProductEntrySchema.create({
        shopkeeperId,
        customerId,
        month: monthName,
        items: [newItem],
        totalAmount: rateNumber,
        status: "Unpaid",
      });

    } else {
    
      const timeDiff =
        (Date.now() - latestEntry.updatedAt.getTime()) / 1000; // seconds

      if (timeDiff <= 60) {
      
        updatedEntry = await ProductEntrySchema.findOneAndUpdate(
          {
            _id: latestEntry._id,
            shopkeeperId,
          },
          {
            $push: { items: newItem },
            $inc: { totalAmount: rateNumber },
          },
          { new: true }
        );
      } else {
        updatedEntry = await ProductEntrySchema.create({
          shopkeeperId,
          customerId,
          month: monthName,
          items: [newItem],
          totalAmount: rateNumber,
          status: "Unpaid",
        });
      }
    }

    res.status(201).json({
      message: "Manual entry processed successfully",
      data: {
        id: updatedEntry._id,
        totalAmount: updatedEntry.totalAmount,
        itemCount: updatedEntry.items.length,
      },
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
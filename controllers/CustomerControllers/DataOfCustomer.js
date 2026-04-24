import express from "express";
import mongoose from "mongoose";
import ProductEntry from "../../model/ProductEntrySchema.js";

const router = express.Router();
router.get("/Data", async (req, res) => {
  try {
    const { Month } = req.query;
    const shopkeeperId = req.user.shopId;
    const customerId = req.user.id;

    if (!customerId || !Month) {
      return res.status(400).json({ message: "customerId or month missing!" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(customerId) ||
      !mongoose.Types.ObjectId.isValid(shopkeeperId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const Data = await ProductEntry.aggregate([
      {
        $match: {
          shopkeeperId: new mongoose.Types.ObjectId(shopkeeperId),
          customerId: new mongoose.Types.ObjectId(customerId),
          month: Month,
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $project: {
          status: 1,
          items: 1,
          date: 1,
          totalAmount: {
            $sum: "$items.rate",
          },
        },
      },
      {
        $limit: 20,
      },
    ]);

    if (!Data.length) {
      return res.status(404).json({
        message: "No data found for given month.",
      });
    }

    res.status(200).json(Data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;

import express from 'express';
import mongoose from 'mongoose';
import ProductEntry from '../../model/ProductEntrySchema.js';

const router = express.Router();
router.get('/showCustomerProduct', async (req, res) => {
  try {
    const { customerId, Month } = req.query;
    const shopkeeperId = req.user.shopId;

    if (!customerId || !Month) {
      return res.status(400).json({ message: "customerId or month missing!" });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customerId" });
    }

    const shopId = new mongoose.Types.ObjectId(shopkeeperId);
    const custId = new mongoose.Types.ObjectId(customerId);

    const Data = await ProductEntry.aggregate([
      {
        $match: {
          shopkeeperId: shopId,
          customerId: custId,
          month: Month
        }
      },
      {
        $sort: { date: -1 }
      },
      {
        $project: {
          status: 1,
          items: 1,
          date: 1,
          totalAmount: { $sum: "$items.rate" }
        }
      },
      {
        $match: { totalAmount: { $gt: 0 } }
      },
      {
        $limit: 20
      }
    ]);

    if (!Data.length) {
      return res.status(404).json({ message: "No data found for given month." });
    }

    res.status(200).json(Data);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ Error: err.message });
  }
});

export default router;

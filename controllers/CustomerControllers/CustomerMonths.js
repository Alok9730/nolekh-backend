import express from "express";
import mongoose from "mongoose";
import ProductSchema from "../../model/ProductEntrySchema.js";

const router = express.Router();
router.get("/show-month", async (req, res) => {
  try {
    const cusId = req.user.id;
    const shopId = req.user.shopId;

    if (!cusId || !shopId) {
      return res.status(400).json({ message: "IDs missing" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(cusId) ||
      !mongoose.Types.ObjectId.isValid(shopId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const CustomerExist = await ProductSchema.aggregate([
      {
        $match: {
          shopkeeperId: new mongoose.Types.ObjectId(shopId),
          customerId: new mongoose.Types.ObjectId(cusId),
        }
      },
      {
        $group: {
          _id: "$month",
          totalAmount: {
            $sum: {
              $sum: "$items.rate" // keeping your logic
            }
          },
          EntryDate: { $max: "$date" },
          customerId: { $first: "$customerId" }
        }
      },
      {
        $sort: { EntryDate: 1 }
      },
      {
        $addFields: { month: "$_id" }
      },
      {
        $project: {
          _id: 0,
          month: 1,
          totalAmount: 1,
          EntryDate: 1,
          customerId: 1
        }
      }
    ]);

    if (!CustomerExist.length) {
      return res.status(404).json({ message: "No Customer Data!" });
    }

    res.status(200).json(CustomerExist);

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;

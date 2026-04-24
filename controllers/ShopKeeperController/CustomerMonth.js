import express from "express";
import mongoose from "mongoose";
import ProductSchema from "../../model/ProductEntrySchema.js";

const router = express.Router();

router.get("/customer-months", async (req, res) => {
  try {
    const shopkeeperId = req.user.shopId;
    const customerId = req.query.Customer;

    if (!customerId)
      return res.status(400).json({ message: "Customer Id required!!" });

    if (!shopkeeperId)
      return res.status(400).json({ message: "shopkeeper Id required!!" });

    if (
      !mongoose.Types.ObjectId.isValid(shopkeeperId) ||
      !mongoose.Types.ObjectId.isValid(customerId)
    ) {
      return res.status(400).json({ message: "Invalid ID format!" });
    }

    const shopId = new mongoose.Types.ObjectId(shopkeeperId);
    const custId = new mongoose.Types.ObjectId(customerId);

    const pipeline = [
      {
        $match: {
          shopkeeperId: shopId,
          customerId: custId,
        },
      },
      {
        $project: {
          month: 1,
          status: 1,
          items: 1,
          date: 1,
          customerId: 1,
        },
      },
      {
        $group: {
          _id: "$month",
          totalAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Unpaid"] },
                { $sum: "$items.rate" },
                0,
              ],
            },
          },
          EntryDate: { $max: "$date" },
          customerId: { $first: "$customerId" },
        },
      },
      { $sort: { EntryDate: 1 } },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: {
          _id: 0,
          month: 1,
          totalAmount: 1,
          EntryDate: 1,
          customerId: 1,
        },
      },
    ];

    const CustomerExist = await ProductSchema.aggregate(pipeline).option({
      maxTimeMS: 5000,
    });

    if (CustomerExist.length === 0)
      return res.status(404).json({ message: "No Customer Data!" });

    res.status(200).json(CustomerExist);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;

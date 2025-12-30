import express from "express";
import mongoose from "mongoose";
import ProductSchema from "../../model/ProductEntrySchema.js";

const router = express.Router();

router.get("/show-month", async (req, res) => {
  try {
  const cusId = req.user.id;
  const shopId = req.user.shopkeeperId;


  if(!cusId || !shopId) return res.json("ID'S missing")

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
          $sum: "$items.rate" 
        }
      },
      EntryDate: { $max: "$date" },
      customerId: { $first: "$customerId" }
    }
  },
  {
    $sort: {
      EntryDate: 1 
    }
  },
  {
    $addFields: {
      month: "$_id"
    }
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



    if (!CustomerExist)
      return res.status(404).json({ message: "No Customer Data!" });


  res.status(200).json(CustomerExist);

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;

import express from "express";
import ProductSchema from "../../model/ProductEntrySchema.js";
const router = express.Router();

router.post("/addCustomerData", async (req, res) => {
  try {
    let TotalAmount = 0;
    const { customerId, items, Month } = req.body;
    const shopkeeperId = req.user.shopId;

    if (!customerId || !shopkeeperId || !items ||  !Month) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    if (!Array.isArray(items) || items.length === 0)
      return res.status(404).json({ message: "items Must not be empty!!" });

    const month = Month?.toLowerCase();

    const ProcessItems = items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      rate: item.rate,
    }));

    items.forEach((item) => {
      TotalAmount += item.rate;
    });

    const newEntry = new ProductSchema({
      shopkeeperId,
      customerId,
      items: ProcessItems,
      totalAmount: TotalAmount,
      status: "unpaid",
      month,
    });

    await newEntry.save();

    res
      .status(201)
      .json({ message: "Customer product entry added successfully!" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json(err.message);
  }
});

export default router;

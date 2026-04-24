import express from "express";
import Users from "../../model/AllUserSchema.js";

const router = express.Router();

router.get("/allCustomer", async (req, res) => {
  try {
    const shopkeeperId = req.user.shopId;
    console.log(shopkeeperId)
    const role = req.user.role;

    if (role !== "shopkeeper") {
      return res.status(403).json({ message: "Access denied" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const customers = await Users.find(
      { role: "customer", shopkeeperId }, 
      { username: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      page,
      count: customers.length,
      data: customers
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router
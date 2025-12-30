import express from "express";
import Users from "../../model/AllUserSchema.js";

const router = express.Router();

router.get("/allCustomer", async (req, res) => {
  try {
    const shopkeeperId = req.user.shopId;
    const shopkeeperRole = req.user.role;
    if (shopkeeperRole !== "shopkeeper")
      return res.status(404).json({ message: "not granted!!" });
    const customerName = await Users.find(
      { role: "customer", shopkeeperId: shopkeeperId },
      { username: 1, _id: 1 ,createdAt:1}
    );
    res.status(201).json(customerName);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error!!" });
  }
});

export default router;

import express from "express";
import ProductEntrySchema from "../../model/ProductEntrySchema.js";

const router = express.Router();

router.post("/ManualDataEntry", async (req, res) => {
  const { customerId, monthName, productName, Qty, Rate } = req.body;
  const shopkeeperId = req.user?.shopId;

  if (!customerId || !monthName || !productName || !Qty || !Rate)
    return res.status(404).json({ Message: "field Missing!" });

  const ExistCustomer = await ProductEntrySchema.findOne({
    customerId,
    shopkeeperId,
    month: monthName,
  });

  if (!ExistCustomer) {
    return res.status(404).json({ message: "Customer Not Exist!!" });
  }
 
  const hasItems  = ExistCustomer.items.length > 0;
   if(!hasItems){
      
   }

  //   let NewEntry = await ExistCustomer.create({
  //     shopkeeperId,
  //     customerId,
  //     month: monthName,
  //     items:[{
  //         productName,
  //         quantity:Qty,
  //         rate:Rate
  //     }],
  //     totalAmount: TotalAmount,
  //     status: "unpaid",
  //   })
  res.status(201).json(ExistCustomer);
});

export default router;

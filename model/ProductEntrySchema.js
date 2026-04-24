import mongoose from "mongoose";

const productEntrySchema = new mongoose.Schema(
  {
    shopkeeperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productName: String,
        quantity: Number,
        rate: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Unpaid",
    },
    month: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

productEntrySchema.index({ shopkeeperId: 1, customerId: 1 });
productEntrySchema.index({ shopkeeperId: 1, customerId: 1, month: 1 });
productEntrySchema.index({ shopkeeperId: 1, customerId: 1, month: 1,date:1 });
export default mongoose.model("ProductSchema", productEntrySchema);
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^[0-9]{10}$/, "Enter a valid 10-digit phone number"]
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "shopkeeper", "customer"],
    required: true
  },
  shopkeeperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.role === "customer";
    }
  }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);


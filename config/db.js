import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo Connection is created!");
  } catch (err) {
    console.log("Mongo Connection not created!" + err.message);
    process.exit(1);
  }
};

export default connectDB;

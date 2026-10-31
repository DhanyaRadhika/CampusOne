import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/campus-one";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("⚠️  MongoDB connection unavailable - using in-memory storage");
    // Continue without MongoDB - in-memory storage will be used
  }
};

export default mongoose;

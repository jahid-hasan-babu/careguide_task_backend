import mongoose from "mongoose";
import config from "../../config";

const connectDB = async (): Promise<void> => {
  const uri = config.database_url as string;
  await mongoose.connect(uri);
  console.log("✅ MongoDB connected successfully!");
};

export default connectDB;

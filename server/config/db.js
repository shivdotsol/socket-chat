import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Database connected");
  } catch (error) {
    console.log("error connecting to DB", error);
    process.exit(1);
  }
};

export default connectDB;

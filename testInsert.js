import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/userModel.js";

dotenv.config();

async function connectDB() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected!");

    const newUser = new User({
      name: "Niranjan Tarigopula",
      email: "niranjantarigopula83@gmail.com",
    });

    const savedUser = await newUser.save();
    console.log("✅ User Saved Successfully:", savedUser);

    // Disconnect after saving
    await mongoose.disconnect();
    console.log("🔌 MongoDB Disconnected.");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

connectDB();

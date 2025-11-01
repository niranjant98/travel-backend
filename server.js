import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import connectDB from "./config/db.js";

import bookingRoutes from "./routes/bookingRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB
connectDB();

// ✅ Razorpay instance (exported for other files if needed)
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Travel Backend is running...");
});

// ✅ API Routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/payment", paymentRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  destination: {
    type: String,
    required: true,
    trim: true,
  },

  travelDate: {
    type: Date,
    required: true,
  },

  members: {
    type: Number,
    required: true,
    min: 1,
  },

  phone: {
    type: String,
    required: true,
    trim: true,
  },

  message: {
    type: String,
    default: "",
  },

  // 💳 Payment Information
  amount: {
    type: Number,
    required: true,
  },
  razorpayOrderId: {
    type: String,
    default: null,
  },
  razorpayPaymentId: {
    type: String,
    default: null,
  },
  razorpaySignature: {
    type: String,
    default: null,
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Booking", bookingSchema);

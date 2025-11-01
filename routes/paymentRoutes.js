import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: "Amount is required" });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ success: false, message: "Server error creating order" });
  }
});

// ✅ Verify Payment
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      name,
      amount,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // ✅ Send Confirmation Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Travel Explorer" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Payment Confirmation - Travel Explorer",
      html: `
        <h2>Hello ${name},</h2>
        <p>Your payment of <strong>₹${amount / 100}</strong> was successful 🎉</p>
        <p>Thank you for booking with Travel Explorer 🌍</p>
      `,
    });

    res.status(200).json({ success: true, message: "Payment verified and email sent!" });
  } catch (error) {
    console.error("❌ Verification Error:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
});

export default router;

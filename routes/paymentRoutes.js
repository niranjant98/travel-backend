import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import sendMail from "../utils/sendMail.js"; // ✅ Import the Brevo mail sender

dotenv.config();
const router = express.Router();

// ✅ Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ success: false, message: "Server error creating order" });
  }
});

// ✅ Verify Payment + Send Confirmation Email
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

    // 🧾 Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature. Payment verification failed.",
      });
    }

    // 📧 Send confirmation email using Brevo
    const subject = "Payment Confirmation - Travel Explorer";
    const html = `
      <h2>Hello ${name},</h2>
      <p>🎉 Your payment of <strong>₹${amount}</strong> was successful!</p>
      <p>Thank you for booking your trip with <b>Travel Explorer</b> 🌍</p>
      <p>We can’t wait to have you onboard. Have a great journey ahead!</p>
      <br/>
      <p style="font-size:12px;color:#555;">Payment ID: ${razorpay_payment_id}</p>
    `;

    await sendMail(email, subject, html);

    res.status(200).json({
      success: true,
      message: "Payment verified and confirmation email sent!",
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment or sending email.",
    });
  }
});

export default router;

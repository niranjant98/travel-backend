import express from "express";
import Booking from "../models/bookingModel.js";
import sendMail from "../utils/sendMail.js";

const router = express.Router();

/**
 * ✅ POST /api/bookings/add
 * Saves booking details after successful payment
 */
router.post("/add", async (req, res) => {
  try {
    const {
      name,
      email,
      destination,
      travelDate,
      members,
      phone,
      message,
      amount,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    // 🧾 Validate required fields
    if (
      !name ||
      !email ||
      !destination ||
      !travelDate ||
      !members ||
      !phone ||
      !amount
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    // 💾 Save booking in DB
    const booking = new Booking({
      name,
      email,
      destination,
      travelDate,
      members,
      phone,
      message,
      amount,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentStatus: "success",
    });

    await booking.save();

    // 📧 Send confirmation email using Brevo
    const html = `
      <h2>Hello ${name},</h2>
      <p>🎉 Your booking for <strong>${destination}</strong> has been confirmed!</p>
      <p><strong>Travel Date:</strong> ${new Date(travelDate).toDateString()}</p>
      <p><strong>No. of Members:</strong> ${members}</p>
      <p><strong>Amount Paid:</strong> ₹${amount}</p>
      <p>We’ll contact you soon with further details. Thank you for choosing <b>Charan Adventures</b>! 🌍</p>
      <br/>
      <p>Best regards,<br/><b>Charan Adventures Team</b></p>
    `;

    await sendMail(email, "Booking Confirmation - Charan Adventures", html);

    res
      .status(200)
      .json({ success: true, message: "Booking saved & email sent!" });
  } catch (error) {
    console.error("❌ Error saving booking:", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving booking",
      error: error.message,
    });
  }
});

export default router;

import express from "express";
import OTP from "../models/otpModel.js";
import sendMail from "../utils/sendMail.js"; // ✅ Use Brevo mailer

const router = express.Router();

// ✅ Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ POST: Send OTP
router.post("/send", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  const otp = generateOTP();

  try {
    // Save OTP in DB (expires in 5 minutes)
    const newOTP = new OTP({ email, otp });
    await newOTP.save();

    // ✅ Send OTP Mail via Brevo
    const subject = "Your OTP for Booking Verification 🔐";
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;">
        <h2>Booking Verification</h2>
        <p>Dear User,</p>
        <p>Your OTP for booking verification is:</p>
        <h1 style="color:#2563eb;letter-spacing:2px;">${otp}</h1>
        <p>This OTP is valid for <strong>5 minutes</strong>.</p>
        <p>Thank you for booking with <strong>Charan Adventures</strong> 🌍</p>
      </div>
    `;

    await sendMail(email, subject, html);
    console.log(`✅ OTP sent successfully to ${email}: ${otp}`);

    res.status(200).json({ success: true, message: "OTP sent to email!" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP." });
  }
});

// ✅ POST: Verify OTP
router.post("/verify", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const validOTP = await OTP.findOne({ email, otp });
    if (!validOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    // ✅ Delete OTP after successful verification
    await OTP.deleteMany({ email });
    res.status(200).json({ success: true, message: "OTP verified successfully!" });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Server error verifying OTP." });
  }
});

export default router;

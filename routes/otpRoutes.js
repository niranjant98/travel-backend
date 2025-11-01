import express from "express";
import nodemailer from "nodemailer";
import OTP from "../models/otpModel.js";

const router = express.Router();

// ✅ Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ POST: Send OTP
router.post("/send", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const otp = generateOTP();

  try {
    // Save OTP in DB
    const newOTP = new OTP({ email, otp });
    await newOTP.save();

    // Send OTP Mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Charan-Adventures" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Booking Verification 🔐",
      text: `Your OTP for booking verification is: ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ OTP sent to ${email}: ${otp}`);
    res.status(200).json({ success: true, message: "OTP sent to email!" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ POST: Verify OTP
router.post("/verify", async (req, res) => {
  const { email, otp } = req.body;

  const validOTP = await OTP.findOne({ email, otp });
  if (!validOTP) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
  }

  await OTP.deleteMany({ email }); // clear OTP after success

  res.status(200).json({ success: true, message: "OTP verified successfully!" });
});

export default router;

// utils/sendMail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendMail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // TLS will be used if available
      auth: {
        user: process.env.SENDER_EMAIL,   // <-- SENDER_EMAIL (verified sender)
        pass: process.env.BREVO_API_KEY,  // <-- BREVO_API_KEY (Brevo SMTP/API key)
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Travel Explorer" <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response || info);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error && error.message ? error.message : error);
    throw error;
  }
};

export default sendMail;

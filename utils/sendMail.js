// utils/sendMail.js
import dotenv from "dotenv";
import Brevo from "@getbrevo/brevo";

dotenv.config();

const sendMail = async (to, subject, html) => {
  try {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = {
      sender: { name: "Charan Adventures", email: process.env.SENDER_EMAIL },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent successfully:", data.messageId || data);
    return data;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};

export default sendMail;

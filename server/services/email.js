import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create Transporter (The Postman)
// For Gmail, you need an "App Password" (https://myaccount.google.com/apppasswords)
// For testing, we can use console.log or Ethereal (fake email)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS, // Your App Password
  },
});

export const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: '"EventPulse Team" <no-reply@eventpulse.com>',
      to: email,
      subject: "Welcome to EventPulse! 🚀",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #2563eb;">Welcome, ${name}!</h1>
            <p>We are thrilled to have you join the <b>EventPulse</b> community.</p>
            <p>Start exploring events near you and connect with amazing people.</p>
            <br/>
            <a href="http://localhost:5173/login" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
            <p>Best regards,<br/>The EventPulse Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Email Error:", error.message);
  }
};

export const sendTicketEmail = async (email, name, eventTitle, ticketId) => {
    try {
      const mailOptions = {
        from: '"EventPulse Tickets" <tickets@eventpulse.com>',
        to: email,
        subject: `Your Ticket for ${eventTitle} 🎟️`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="color: #4f46e5;">You're going to ${eventTitle}!</h2>
              <p>Hi ${name}, your spot is confirmed.</p>
              <div style="background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p><strong>Ticket ID:</strong> ${ticketId}</p>
                <p><strong>Status:</strong> Confirmed ✅</p>
              </div>
              <p>Show the QR code in the app at the entrance.</p>
              <br/>
              <p>See you there!</p>
          </div>
        `,
      };
  
      await transporter.sendMail(mailOptions);
      console.log(`📧 Ticket email sent to ${email}`);
    } catch (error) {
      console.error("Email Error:", error.message);
    }
  };
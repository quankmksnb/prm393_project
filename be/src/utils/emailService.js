// src/utils/emailService.js
import nodemailer from "nodemailer";

export const sendEmailOtp = async ({ to, otp }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // app password
    },
  });

  await transporter.sendMail({
    from: `"Foodify" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Foodify verification code",
    text: `Your verification code is: ${otp} (valid for 2 minutes)`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif; line-height:1.6">
        <h2>Foodify – Verify your email</h2>
        <p>Your verification code:</p>
        <div style="font-size:28px; font-weight:700; letter-spacing:4px">${otp}</div>
        <p>Code expires in <b>2 minutes</b>. If this wasn't you, ignore this email.</p>
      </div>
    `,
  });
};

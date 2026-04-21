import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();


// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // Use true for port 465, false for port 587
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// for reset password (user ke liye )
export const sendOtpMail=async({to,otp})=>{
      await transporter.sendMail({
         from:process.env.EMAIL,
         to,
         subject:"Reset Your Password",
         html:`<p>Your OTP for password reset is <b>${otp}</b>.Its expires in 5 minutes.</p>`
      })
}


// for deliveryBoy ke liye delivered 
export const sendDeliveryOtpMail=async({user,otp})=>{
      await transporter.sendMail({
         from:process.env.EMAIL,
         to:user.email,
         subject:"Delivery OTP",
         html:`<p>Your OTP for delivery is <b>${otp}</b>.Its expires in 5 minutes.</p>`
      })
}
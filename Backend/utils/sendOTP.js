import nodemailer from "nodemailer";

export const otpStore = {};  // temp memory store

export const sendOTPEmail = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); 

  otpStore[email] = otp;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `EcoDrive Auth <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code - EcoDrive",
    html: `<h2>Your OTP: <b>${otp}</b></h2> <p>Valid for 5 minutes.</p>`,
  });

  return otp;
};

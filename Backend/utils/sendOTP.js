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

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111;">
      <div style="max-width:600px;margin:0 auto;padding:20px;background:#fff;border-radius:8px;">
        <div style="text-align:center;padding:10px 0;">
          <h2 style="margin:0;color:#0b84ff;">driveSutraGo — Email Verification</h2>
        </div>
        <div style="padding:20px;border-radius:6px;background:#f8fafc;">
          <p style="margin:0 0 10px 0;">Hello,</p>
          <p style="margin:0 0 20px 0;color:#374151;">Thank you for choosing driveSutraGo. Use the One-Time Passcode (OTP) below to verify your email address. This code is valid for 5 minutes.</p>
          <div style="text-align:center;margin:18px 0;">
            <div style="display:inline-block;padding:16px 22px;background:#111827;color:white;font-weight:700;border-radius:8px;font-size:22px;letter-spacing:6px;">${otp}</div>
          </div>
          <p style="color:#6b7280;font-size:13px;margin-top:8px;">If you didn't request this, please ignore this email or contact <a href=\"mailto:support@drivesutrago.com\">support@drivesutrago.com</a>.</p>
          <p style="margin-top:18px;"><a href="${frontendUrl}" style="color:#0b84ff;">Open driveSutraGo</a></p>
        </div>
        <div style="text-align:center;margin-top:18px;color:#9ca3af;font-size:12px;">driveSutraGo — Making every journey count</div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `driveSutraGo <no-reply@drivesutrago.com>`,
    to: email,
    subject: "Your driveSutraGo verification code",
    html,
  });

  return otp;
};

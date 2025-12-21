import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, message) => {
  // If email credentials are not configured, fallback to console logging (development)
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn("EMAIL_USER or EMAIL_PASS not set — falling back to console.log for emails.");
    console.log(`--- Email to: ${email} ---`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log('--- End Email ---');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  const fromAddress = process.env.EMAIL_FROM || `driveSutraGo <no-reply@drivesutrago.com>`;

  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject,
    html: message,
  });
};

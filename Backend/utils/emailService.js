import nodemailer from 'nodemailer';

// Use the exact same configuration as the working OTP email service
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn("EMAIL_USER or EMAIL_PASS not set — email sending disabled.");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
};

// Send reward confirmation email
export async function sendRewardConfirmationEmail(user, userReward, reward) {
  try {
    console.log('📧 Sending reward email to:', user.email);
    
    const transporter = createTransporter();
    if (!transporter) {
      console.log('📧 Email transporter not available - credentials missing');
      return false;
    }

    const mailOptions = {
      from: "DriveSutraGo <no-reply@drivesutrago.com>",
      to: user.email,
      subject: `🎉 Reward Redeemed Successfully - ${reward.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reward Confirmation</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .reward-card { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #10b981; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
            .coupon-code { background: #1f2937; color: #10b981; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 15px 0; }
            .footer { background: #1f2937; color: white; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Reward Redeemed!</h1>
              <p>Congratulations ${user.firstName}! Your eco-friendly journey just got rewarded.</p>
            </div>
            
            <div class="content">
              <div class="reward-card">
                <h2 style="color: #10b981; margin: 0 0 10px 0;">${reward.icon} ${reward.title}</h2>
                <p style="color: #64748b; margin: 10px 0;">${reward.description}</p>
                <div style="font-size: 18px; color: #1f2937; margin: 10px 0;">
                  <strong>Value: ₹${reward.value}${reward.discountPercentage ? ` (${reward.discountPercentage}% off)` : ''}</strong>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <h3 style="color: #1f2937; margin-bottom: 10px;">Your Coupon Code</h3>
                <div class="coupon-code">${userReward.couponCode}</div>
                <p style="color: #64748b; font-size: 14px;">Save this code - you'll need it for redemption!</p>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <h4 style="color: #f59e0b; margin: 0 0 10px 0;">📋 How to Use</h4>
                <p style="margin: 0; color: #92400e;">${reward.instructions}</p>
                ${userReward.expiresAt ? `<p style="margin: 10px 0 0 0; color: #dc2626; font-weight: bold;">⏰ Expires: ${new Date(userReward.expiresAt).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>` : ''}
              </div>
              
              <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h3 style="margin: 0 0 15px 0;">🌍 Thank You for Making a Difference!</h3>
                <p style="margin: 0 0 15px 0;">
                  Your eco-friendly choices are helping create a sustainable future. Every trip you take with 
                  environmental consciousness contributes to reducing carbon emissions and protecting our planet.
                </p>
                <div>
                  <span style="display: inline-block; background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; margin: 5px;">🌱 ${user.co2Saved?.toFixed(1) || 0} kg CO₂ Saved</span>
                  <span style="display: inline-block; background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; margin: 5px;">🌳 ${user.treesGrown || 0} Trees Grown</span>
                  <span style="display: inline-block; background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; margin: 5px;">🚶 ${user.totalTrips || 0} Eco Trips</span>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #64748b;">
                  Need help with your reward? Contact us at 
                  <a href="mailto:support@drivesutrago.com" style="color: #10b981;">support@drivesutrago.com</a>
                </p>
              </div>
            </div>
            
            <div class="footer">
              <h3 style="margin: 0 0 10px 0;">🚗 DriveSutraGo</h3>
              <p style="margin: 0; color: #9ca3af;">
                Making every journey count for a sustainable future
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Reward confirmation email sent successfully to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending reward confirmation email:', error.message);
    return false;
  }
}

// Send welcome email for new users
export async function sendWelcomeEmail(user) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('📧 Email transporter not available - credentials missing');
      return false;
    }

    const mailOptions = {
      from: "DriveSutraGo <no-reply@drivesutrago.com>",
      to: user.email,
      subject: '🌍 Welcome to DriveSutraGo - Start Your Eco Journey!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to DriveSutraGo</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 40px; text-align: center; }
            .content { padding: 30px; }
            .footer { background: #1f2937; color: white; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌍 Welcome to DriveSutraGo!</h1>
              <p>Hi ${user.firstName}, ready to make every journey count for our planet?</p>
            </div>
            
            <div class="content">
              <h2>🎉 Your Eco Journey Starts Now!</h2>
              <p>Thank you for joining DriveSutraGo - India's first gamified eco-mobility platform. You're now part of a community that's making transportation sustainable, one trip at a time.</p>
              
              <h3>🎁 Welcome Bonus</h3>
              <p>As a welcome gift, you've received:</p>
              <ul>
                <li>✅ 25 Carbon Credits to start with</li>
                <li>✅ Access to beginner challenges</li>
                <li>✅ Eco score tracking</li>
                <li>✅ Leaderboard participation</li>
              </ul>
            </div>
            
            <div class="footer">
              <h3>🚗 DriveSutraGo</h3>
              <p>Making every journey count for a sustainable future</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    return false;
  }
}

export default {
  sendRewardConfirmationEmail,
  sendWelcomeEmail
};
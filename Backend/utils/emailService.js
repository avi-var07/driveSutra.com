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
      from: "driveSutraGo <no-reply@drivesutrago.com>",
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
              <h3 style="margin: 0 0 10px 0;">🚗 driveSutraGo</h3>
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
      from: "driveSutraGo <no-reply@drivesutrago.com>",
      to: user.email,
      subject: '🌍 Welcome to driveSutraGo - Start Your Eco Journey!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to driveSutraGo</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 40px; text-align: center; }
            .content { padding: 30px; }
            .cta { text-align: center; margin: 20px 0; }
            .btn { background: #10b981; color: white; padding: 12px 18px; border-radius: 8px; text-decoration: none; display: inline-block; }
            .footer { background: #1f2937; color: white; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌍 Welcome to driveSutraGo!</h1>
              <p>Hi ${user.firstName}, welcome aboard — let's make every journey count.</p>
            </div>
            
            <div class="content">
              <h2>🎉 What you can do next</h2>
              <ol>
                <li><strong>Plan a Trip:</strong> Open the Trips page and set start & destination.</li>
                <li><strong>Choose a Mode:</strong> Select Walk, Cycle, Public, or Car and compare eco scores.</li>
                <li><strong>Start Navigation:</strong> Use live tracking to follow your route and collect eco points.</li>
                <li><strong>Redeem Rewards:</strong> Complete trips and challenges to unlock coupons and credits.</li>
              </ol>

              <div class="cta">
                <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/trip/new">Plan Your First Trip</a>
              </div>
            </div>
            
            <div class="footer">
              <h3>🚗 driveSutraGo</h3>
              <p>Features: Live navigation, eco-score tracking, rewards & challenges — start your first trip now.</p>
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

// Send trip completion summary email
export async function sendTripCompletionEmail(user, trip, rewards) {
  try {
    const transporter = createTransporter();
    if (!transporter) return false;

    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';

    const mailOptions = {
      from: "driveSutraGo <no-reply@drivesutrago.com>",
      to: user.email,
      subject: `✅ Trip Completed — Summary & Impact (${trip.mode})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Trip Summary</title>
          <style>body{font-family:Arial,Helvetica,sans-serif;color:#111}</style>
        </head>
        <body>
          <div style="max-width:600px;margin:0 auto;padding:20px;background:#fff;border-radius:8px;">
            <h2 style="color:#0b84ff;margin:0 0 8px 0">Trip Completed — Thank you!</h2>
            <p>Hi ${user.firstName},</p>
            <p>Thanks for completing your trip with driveSutraGo. Here is a quick summary of your journey:</p>
            <ul>
              <li><strong>Mode:</strong> ${trip.mode}</li>
              <li><strong>Distance:</strong> ${trip.distanceKm || 0} km</li>
              <li><strong>Duration:</strong> ${trip.actualMinutes || trip.etaMinutes} minutes</li>
              <li><strong>Eco Score:</strong> ${trip.ecoScore || '—'}</li>
            </ul>
            <div style="background:#ecfdf5;padding:12px;border-radius:8px;margin:12px 0;">
              <p style="margin:0;">You contributed <strong>${(trip.co2Saved || 0).toFixed(1)} kg CO₂</strong> saved and helped grow approximately <strong>${trip.treesGrown || 0}</strong> trees (est.).</p>
            </div>
            <h4>Rewards Earned</h4>
            <p>XP: <strong>${rewards.xp}</strong> • Carbon Credits: <strong>${rewards.carbonCredits}</strong></p>
            <div style="text-align:center;margin:16px 0;"><a href="${frontend}/trips/${trip._id}" style="background:#10b981;color:white;padding:10px 14px;border-radius:8px;text-decoration:none;">View Trip Details</a></div>
            <p style="color:#6b7280;font-size:13px;">What's next: Try a challenge, invite friends, or plan another eco-friendly trip to keep earning rewards.</p>
            <div style="margin-top:18px;color:#9ca3af;font-size:12px;">driveSutraGo — Making every journey count.</div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Trip completion email sent to ${user.email}`);
    return true;
  } catch (err) {
    console.error('❌ Error sending trip completion email:', err.message || err);
    return false;
  }
}

export default {
  sendRewardConfirmationEmail,
  sendWelcomeEmail,
  sendTripCompletionEmail
};
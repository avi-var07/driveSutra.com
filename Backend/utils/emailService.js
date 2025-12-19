import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send reward confirmation email
export async function sendRewardConfirmationEmail(user, userReward, reward) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
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
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
            .stat-card { background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #10b981; }
            .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
            .instructions { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; }
            .footer { background: #1f2937; color: white; padding: 20px; text-align: center; }
            .eco-badge { display: inline-block; background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; margin: 5px; }
            .thank-you { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1>🎉 Reward Redeemed!</h1>
              <p>Congratulations ${user.firstName}! Your eco-friendly journey just got rewarded.</p>
            </div>
            
            <!-- Content -->
            <div class="content">
              <!-- Reward Details -->
              <div class="reward-card">
                <h2 style="color: #10b981; margin: 0 0 10px 0;">${reward.icon} ${reward.title}</h2>
                <p style="color: #64748b; margin: 10px 0;">${reward.description}</p>
                <div style="font-size: 18px; color: #1f2937; margin: 10px 0;">
                  <strong>Value: ${reward.currency === 'INR' ? '₹' : ''}${reward.value}${reward.discountPercentage ? ` (${reward.discountPercentage}% off)` : ''}</strong>
                </div>
              </div>
              
              <!-- Coupon Code -->
              <div style="text-align: center; margin: 30px 0;">
                <h3 style="color: #1f2937; margin-bottom: 10px;">Your Coupon Code</h3>
                <div class="coupon-code">${userReward.couponCode}</div>
                <p style="color: #64748b; font-size: 14px;">Save this code - you'll need it for redemption!</p>
              </div>
              
              <!-- Instructions -->
              <div class="instructions">
                <h4 style="color: #f59e0b; margin: 0 0 10px 0;">📋 How to Use</h4>
                <p style="margin: 0; color: #92400e;">${reward.instructions}</p>
                ${userReward.expiresAt ? `<p style="margin: 10px 0 0 0; color: #dc2626; font-weight: bold;">⏰ Expires: ${new Date(userReward.expiresAt).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>` : ''}
              </div>
              
              <!-- User Stats -->
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${userReward.carbonCreditsSpent}</div>
                  <div class="stat-label">Credits Spent</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${user.carbonCredits}</div>
                  <div class="stat-label">Credits Remaining</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${user.ecoScore}</div>
                  <div class="stat-label">Eco Score</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">Level ${user.level}</div>
                  <div class="stat-label">Your Level</div>
                </div>
              </div>
              
              <!-- Thank You Message -->
              <div class="thank-you">
                <h3 style="margin: 0 0 15px 0;">🌍 Thank You for Making a Difference!</h3>
                <p style="margin: 0 0 15px 0;">
                  Your eco-friendly choices are helping create a sustainable future. Every trip you take with 
                  environmental consciousness contributes to reducing carbon emissions and protecting our planet.
                </p>
                <div>
                  <span class="eco-badge">🌱 ${user.co2Saved?.toFixed(1) || 0} kg CO₂ Saved</span>
                  <span class="eco-badge">🌳 ${user.treesGrown || 0} Trees Grown</span>
                  <span class="eco-badge">🚶 ${user.totalTrips || 0} Eco Trips</span>
                </div>
              </div>
              
              <!-- Additional Info -->
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #1f2937; margin: 0 0 15px 0;">💡 Keep Earning More Rewards</h4>
                <ul style="color: #64748b; margin: 0; padding-left: 20px;">
                  <li>Take more eco-friendly trips to earn carbon credits</li>
                  <li>Choose walking, cycling, or public transport</li>
                  <li>Maintain your eco score above 70 for premium rewards</li>
                  <li>Complete daily challenges for bonus credits</li>
                  <li>Invite friends to join the eco movement</li>
                </ul>
              </div>
              
              <!-- Support -->
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #64748b;">
                  Need help with your reward? Contact us at 
                  <a href="mailto:support@drivesutrago.com" style="color: #10b981;">support@drivesutrago.com</a>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <h3 style="margin: 0 0 10px 0;">🚗 DriveSutraGo</h3>
              <p style="margin: 0; color: #9ca3af;">
                Making every journey count for a sustainable future
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
                This email was sent to ${user.email}. 
                <a href="#" style="color: #10b981;">Unsubscribe</a> | 
                <a href="#" style="color: #10b981;">Privacy Policy</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reward confirmation email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending reward confirmation email:', error);
    return false;
  }
}

// Send welcome email for new users
export async function sendWelcomeEmail(user) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
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
            .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
            .feature-card { background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; }
            .cta-button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
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
              
              <div class="feature-grid">
                <div class="feature-card">
                  <h3>🚶 Track Eco Trips</h3>
                  <p>Log walking, cycling, and public transport trips to earn carbon credits</p>
                </div>
                <div class="feature-card">
                  <h3>🏆 Earn Rewards</h3>
                  <p>Redeem credits for vouchers, experiences, and eco-friendly products</p>
                </div>
                <div class="feature-card">
                  <h3>🌱 Make Impact</h3>
                  <p>See your real environmental impact with CO₂ saved and trees grown</p>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="#" class="cta-button">Start Your First Eco Trip</a>
              </div>
              
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
    console.log(`Welcome email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

export default {
  sendRewardConfirmationEmail,
  sendWelcomeEmail
};
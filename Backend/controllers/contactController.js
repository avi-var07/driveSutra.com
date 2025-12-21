import { sendEmail } from '../utils/sendEmail.js';

// Send contact form message
export async function sendContactMessage(req, res) {
  try {
    const { name, email, subject, category, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Email to admin
    const adminEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #10b981; }
          .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #10b981; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">🚗 New Contact Form Submission</h2>
            <p style="margin: 5px 0 0 0;">driveSutraGo Contact Form</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">👤 Name:</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">📧 Email:</div>
              <div class="value">${email}</div>
            </div>
            <div class="field">
              <div class="label">📂 Category:</div>
              <div class="value">${category}</div>
            </div>
            <div class="field">
              <div class="label">📝 Subject:</div>
              <div class="value">${subject}</div>
            </div>
            <div class="field">
              <div class="label">💬 Message:</div>
              <div class="value">${message}</div>
            </div>
            <div class="footer">
              <p>This message was sent from the driveSutraGo contact form</p>
              <p>Reply to: ${email}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to admin
    await sendEmail(
      'aviralvarshney07@gmail.com',
      `[driveSutraGo] ${category.toUpperCase()}: ${subject}`,
      adminEmailContent
    );

    // Send confirmation email to user
    const userEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; }
          .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✅ Message Received!</h1>
            <p style="margin: 10px 0 0 0;">Thank you for contacting driveSutraGo</p>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for reaching out to us! We've received your message and our team will get back to you within 24 hours.</p>
            
            <div class="message-box">
              <h3 style="margin-top: 0; color: #10b981;">Your Message Summary:</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Message:</strong></p>
              <p style="color: #64748b;">${message}</p>
            </div>

            <p>In the meantime, feel free to explore our platform and start tracking your eco-friendly journeys!</p>
            
            <div style="text-align: center;">
              <a href="http://localhost:5173/dashboard" class="button">Go to Dashboard</a>
            </div>

            <div class="footer">
              <p><strong>🚗 driveSutraGo</strong></p>
              <p>Making every journey count for a sustainable future</p>
                <p style="margin-top: 10px;">
                Need immediate help? Email us at 
                <a href="mailto:support@drivesutrago.com" style="color: #10b981;">support@drivesutrago.com</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send confirmation to user
    await sendEmail(
      email,
      'Thank you for contacting driveSutraGo',
      userEmailContent
    );

    console.log(`✅ Contact form message sent from ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully! We\'ll get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
}

export default {
  sendContactMessage
};

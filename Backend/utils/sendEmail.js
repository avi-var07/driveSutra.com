import nodemailer from 'nodemailer';

const createTransporter = () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.warn("EMAIL_USER or EMAIL_PASS not set — email sending disabled.");
        return null;
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
    });
};

/**
 * Send an email with HTML content
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
export async function sendEmail(to, subject, html) {
    try {
        const transporter = createTransporter();
        if (!transporter) {
            console.log('📧 Email transporter not available — credentials missing');
            return false;
        }

        const mailOptions = {
            from: `driveSutraGo <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}: ${subject}`);
        return true;
    } catch (error) {
        console.error('❌ Email send error:', error.message);
        return false;
    }
}

export default sendEmail;

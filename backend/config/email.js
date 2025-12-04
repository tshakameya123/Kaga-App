import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
    // For Gmail, you need to use App Password (not regular password)
    // Go to: Google Account > Security > 2-Step Verification > App passwords
    const emailPassword = (process.env.EMAIL_APP_PASSWORD || '').replace(/\s/g, ''); // Remove any spaces
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || process.env.ADMIN_EMAIL,
            pass: emailPassword
        }
    });
};

// Send email function
export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"Kaga Health" <${process.env.EMAIL_USER || process.env.ADMIN_EMAIL}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, '') // Fallback plain text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

// Password reset email template
export const sendPasswordResetEmail = async (email, resetUrl, userName = 'User') => {
    const subject = 'Kaga Health - Password Reset Request';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #5f6FFF 0%, #4A5AE8 100%); border-radius: 16px 16px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🏥 Kaga Health</h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
                                
                                <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                                    Hello ${userName},
                                </p>
                                
                                <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                                    We received a request to reset your password for your Kaga Health account. Click the button below to create a new password:
                                </p>
                                
                                <!-- Button -->
                                <table role="presentation" style="margin: 30px 0; width: 100%;">
                                    <tr>
                                        <td align="center">
                                            <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #5f6FFF 0%, #4A5AE8 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 12px rgba(95, 111, 255, 0.4);">
                                                Reset Password
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.6;">
                                    Or copy and paste this link in your browser:
                                </p>
                                <p style="margin: 0 0 20px; word-break: break-all;">
                                    <a href="${resetUrl}" style="color: #5f6FFF; font-size: 14px;">${resetUrl}</a>
                                </p>
                                
                                <div style="margin-top: 30px; padding: 20px; background-color: #FFF8E7; border-radius: 12px; border-left: 4px solid #F59E0B;">
                                    <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.5;">
                                        ⏰ <strong>This link expires in 1 hour.</strong><br>
                                        If you didn't request this password reset, please ignore this email or contact support if you have concerns.
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 16px 16px; text-align: center;">
                                <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                                    This email was sent by Kaga Health
                                </p>
                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                    © ${new Date().getFullYear()} Kaga Health. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    return sendEmail({ to: email, subject, html });
};

export default { sendEmail, sendPasswordResetEmail };

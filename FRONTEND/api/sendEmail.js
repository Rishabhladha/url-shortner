import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  // 2. Connect to Gmail SMTP (Vercel allows port 465)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // This must be a Gmail App Password
    },
  });

  const mailOptions = {
    from: `"SnapURL" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔑 Your SnapURL Password Reset OTP",
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; padding: 40px 20px; color: #333333;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #E9A84C; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">SnapURL</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="font-size: 18px; color: #1e293b; margin-top: 0; margin-bottom: 16px;">Password Reset</h2>
            <p style="font-size: 15px; color: #475569; margin-bottom: 24px; line-height: 1.5;">You requested a password reset for your account. Please use the verification code below to continue:</p>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <span style="display: block; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: bold;">Verification Code</span>
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #1e3a8a; font-family: monospace;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">⏰ This code will expire in <strong>10 minutes</strong>.</p>
            <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">If you did not request this, you can safely ignore this email.</p>
          </div>
          <div style="background-color: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">© ${new Date().getFullYear()} SnapURL. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('SMTP Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

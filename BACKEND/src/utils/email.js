import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"SnapURL" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🔑 Your SnapURL Password Reset OTP",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0C0C0C; color: #E8E8E8; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
        <div style="background: linear-gradient(135deg, #C9932A, #e6b84a); padding: 28px 32px; text-align: center;">
          <h1 style="margin: 0; color: #0C0C0C; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">⚡ SnapURL</h1>
          <p style="margin: 4px 0 0; color: rgba(0,0,0,0.6); font-size: 13px;">Password Reset Request</p>
        </div>
        <div style="padding: 32px;">
          <p style="margin: 0 0 20px; font-size: 15px; color: #c0c0c0;">
            You requested a password reset. Use the OTP below to continue:
          </p>
          <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 10px; padding: 24px; text-align: center; margin: 0 0 24px;">
            <p style="margin: 0 0 8px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Your OTP</p>
            <p style="margin: 0; font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #C9932A; font-family: monospace;">${otp}</p>
          </div>
          <p style="margin: 0 0 8px; font-size: 13px; color: #888;">
            ⏰ This OTP expires in <strong style="color: #c0c0c0;">10 minutes</strong>.
          </p>
          <p style="margin: 0; font-size: 13px; color: #888;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
        <div style="padding: 16px 32px; border-top: 1px solid #222; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #555;">© ${new Date().getFullYear()} SnapURL — Fast, simple link shortening</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

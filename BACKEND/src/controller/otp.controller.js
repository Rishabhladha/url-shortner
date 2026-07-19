import wrapAsync from "../utils/tryCatchWrapper.js"
import { findUserByEmail, findUserByEmailWithOtp, saveOtp, clearOtp, changeUserPassword } from "../dao/user.dao.js"
import { sendOtpEmail } from "../utils/email.js"
import { BadRequestError, NotFoundError } from "../utils/errorHandler.js"

// Generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

export const sendForgotPasswordOtp = wrapAsync(async (req, res) => {
    const { email } = req.body
    if (!email) throw new BadRequestError("Email is required")

    const user = await findUserByEmail(email)
    if (!user) throw new NotFoundError("No account found with this email")

    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await saveOtp(email, otp, otpExpiry)
    await sendOtpEmail(email, otp)

    res.status(200).json({message: "OTP sent to your email"})
})

export const verifyOtpAndResetPassword = wrapAsync(async (req, res) => {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) throw new BadRequestError("All fields are required")
    if (newPassword.length < 6) throw new BadRequestError("Password must be at least 6 characters")

    const user = await findUserByEmailWithOtp(email)
    if (!user) throw new NotFoundError("No account found with this email")
    if (!user.otp || !user.otpExpiry) throw new BadRequestError("No OTP requested. Please request a new one")

    if (user.otp !== otp) throw new BadRequestError("Invalid OTP")
    if (new Date() > user.otpExpiry) throw new BadRequestError("OTP has expired. Please request a new one")

    await changeUserPassword(user._id, newPassword)
    await clearOtp(email)

    res.status(200).json({message: "Password reset successfully. You can now login."})
})

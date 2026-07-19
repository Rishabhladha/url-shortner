import express from "express"
import { register_user, login_user, logout_user, get_current_user } from "../controller/auth.controller.js"
import { sendForgotPasswordOtp, verifyOtpAndResetPassword } from "../controller/otp.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/register", register_user)
router.post("/login", login_user)
router.post("/logout", logout_user)
router.get("/logout", logout_user)
router.get("/me", authMiddleware, get_current_user)

// Forgot password OTP flow
router.post("/forgot-password", sendForgotPasswordOtp)
router.post("/reset-password", verifyOtpAndResetPassword)

export default router
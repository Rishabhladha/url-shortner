import express from "express"
import {
    getUserUrlsPaginatedController,
    updateProfile,
    changePassword,
    deleteAccount
} from "../controller/user.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/urls/paginated", authMiddleware, getUserUrlsPaginatedController)
router.put("/profile", authMiddleware, updateProfile)
router.put("/change-password", authMiddleware, changePassword)
router.delete("/account", authMiddleware, deleteAccount)

export default router
import express from "express"
import { deleteUrl } from "../controller/url.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"

const router = express.Router()

router.delete("/:id", authMiddleware, deleteUrl)

export default router

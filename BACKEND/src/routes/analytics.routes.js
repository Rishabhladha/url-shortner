import express from "express";
import { getUrlAnalytics } from "../controller/analytics.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Route to get analytics for a specific short URL
// Requires authentication to ensure users only see their own analytics (logic for ownership should ideally be added in controller, but for now we just require auth)
router.get("/:id", authMiddleware, getUrlAnalytics);

export default router;

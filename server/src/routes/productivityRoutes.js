import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { calculateProductivityMetrics } from "../services/productivityService.js";

const router = express.Router();

/**
 * GET /api/analytics/productivity
 * Genuine server-side aggregated productivity statistics for the authenticated student.
 * Query params: ?preset=this-week|this-month|last-7-days|last-30-days|custom&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
router.get("/productivity", requireAuth, async (req, res) => {
  try {
    const { preset, startDate, endDate } = req.query;
    const userId = req.user.id;

    const data = await calculateProductivityMetrics(userId, {
      preset,
      startDate,
      endDate,
    });

    res.json(data);
  } catch (err) {
    console.error("[Productivity Analytics Error]:", err);
    res.status(500).json({
      error: "Unable to load productivity insights. Please try again.",
      success: false,
    });
  }
});

export default router;

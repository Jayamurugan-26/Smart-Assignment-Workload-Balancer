import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getDashboardStatistics, balanceStudentWorkload } from "../services/workloadBalancer.js";

const router = express.Router();

/**
 * GET /api/balancer/statistics
 * Genuine database statistics for dashboard metrics cards.
 * Zero random or mock hardcoded values.
 */
router.get("/statistics", requireAuth, async (req, res) => {
  try {
    const stats = await getDashboardStatistics(req.user.id);
    res.json(stats);
  } catch (err) {
    console.error("Dashboard statistics error:", err);
    res.status(500).json({ error: "Failed to compute dashboard metrics", details: err.message });
  }
});

/**
 * POST /api/balancer/calculate
 * Run ML Workload Balancer & Burnout Peak detection
 */
router.post("/calculate", requireAuth, async (req, res) => {
  try {
    const result = await balanceStudentWorkload(req.user);

    // Emit Socket.IO event for live dashboard update
    const io = req.app.get("io");
    if (io) {
      io.to(req.user.id).emit("workload:balanced", {
        overallRisk: result.overallRisk,
        scheduledBlocksCount: result.scheduledBlocksCount,
      });
    }

    res.json({
      success: true,
      message: "Workload successfully analyzed and balanced",
      ...result,
    });
  } catch (err) {
    console.error("Workload balancer error:", err);
    res.status(500).json({ error: "Failed to balance workload", details: err.message });
  }
});

export default router;
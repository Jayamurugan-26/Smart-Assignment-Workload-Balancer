import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import prisma from "../prisma.js";

const router = express.Router();

/**
 * GET /api/analysis-history
 * Retrieves past photo and document analysis sessions for current user.
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const sessions = await prisma.fileAnalysisSession.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const parsedSessions = sessions.map(s => ({
      ...s,
      analysis: s.analysisResult ? JSON.parse(s.analysisResult) : null,
    }));

    res.json({ success: true, sessions: parsedSessions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analysis history", details: err.message });
  }
});

/**
 * GET /api/analysis-history/:id
 * Reopens a specific previous analysis session.
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const session = await prisma.fileAnalysisSession.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!session) {
      return res.status(404).json({ error: "Analysis session not found" });
    }

    res.json({
      success: true,
      session: {
        ...session,
        analysis: session.analysisResult ? JSON.parse(session.analysisResult) : null,
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch session", details: err.message });
  }
});

/**
 * DELETE /api/analysis-history/:id
 * Deletes an analysis session from history.
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.fileAnalysisSession.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });

    res.json({ success: true, message: "Analysis session deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete session", details: err.message });
  }
});

export default router;

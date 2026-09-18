import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { handleAiChat } from "./aiRoutes.js";
import prisma from "../prisma.js";

const router = express.Router();

/**
 * POST /api/chat/message
 * Backward-compatible endpoint delegating to the unified handleAiChat handler.
 */
router.post("/message", requireAuth, handleAiChat);

/**
 * GET /api/chat/history
 * Retrieves chat history for current user.
 */
router.get("/history", requireAuth, async (req, res) => {
  try {
    const messages = await prisma.aiChatMessage.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat history", details: err.message });
  }
});

/**
 * DELETE /api/chat/history
 * Clears chat history for current user.
 */
router.delete("/history", requireAuth, async (req, res) => {
  try {
    await prisma.aiChatMessage.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({ success: true, message: "Chat history cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear chat history", details: err.message });
  }
});

export default router;

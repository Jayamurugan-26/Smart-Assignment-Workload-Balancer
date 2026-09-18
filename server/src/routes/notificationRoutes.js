import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import prisma from "../prisma.js";

const router = express.Router();

/**
 * GET /api/notifications
 * List all notifications for current user with unread count.
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications", details: err.message });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark single notification as read.
 */
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const updated = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true },
    });

    res.json({ success: true, updatedCount: updated.count });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notification read", details: err.message });
  }
});

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read for current user.
 */
router.post("/read-all", requireAuth, async (req, res) => {
  try {
    const updated = await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true, count: updated.count });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all as read", details: err.message });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification.
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });

    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notification", details: err.message });
  }
});

export default router;

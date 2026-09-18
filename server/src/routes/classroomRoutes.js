import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { syncClassroomData } from "../services/classroomService.js";
import { notifyClassroomSync } from "../services/notificationService.js";
import prisma from "../prisma.js";

const router = express.Router();

/**
 * POST /api/classroom/sync
 * Sync courses and assignments from Google Classroom.
 * Follows duplicate-prevention and local-state-preservation rules.
 */
router.post("/sync", requireAuth, async (req, res) => {
  try {
    const result = await syncClassroomData(req.user);

    // Emit real-time update and record notification
    const io = req.app.get("io");
    if (io) {
      io.to(req.user.id).emit("classroom:synced", {
        syncedCount: result.syncedCount,
        isUsingMock: result.isUsingMock,
      });

      await notifyClassroomSync({
        userId: req.user.id,
        syncedCount: result.syncedCount,
        io,
      });
    }

    res.json({
      success: true,
      message: "Classroom data synchronized successfully",
      isUsingMock: result.isUsingMock,
      syncedCount: result.syncedCount,
    });
  } catch (err) {
    console.error("Classroom sync error:", err);
    res.status(500).json({ error: "Failed to sync with Google Classroom", details: err.message });
  }
});

/**
 * GET /api/classroom/courses
 * List courses with assignment count
 */
router.get("/courses", requireAuth, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: {
            assignments: {
              where: { deletedAt: null }
            }
          }
        }
      }
    });

    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch courses", details: err.message });
  }
});

export default router;
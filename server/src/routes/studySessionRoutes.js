import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import prisma from "../prisma.js";

const router = express.Router();

/**
 * GET /api/study-sessions/active
 * Retrieve currently active or paused session for the authenticated student.
 */
router.get("/active", requireAuth, async (req, res) => {
  try {
    const activeSession = await prisma.studySession.findFirst({
      where: {
        userId: req.user.id,
        status: { in: ["ACTIVE", "PAUSED"] },
      },
      include: {
        assignment: { select: { id: true, title: true, course: true } },
        course: { select: { id: true, name: true, code: true, color: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    res.json({
      success: true,
      session: activeSession || null,
    });
  } catch (err) {
    console.error("[StudySession Active Error]:", err);
    res.status(500).json({ error: "Failed to fetch active study session" });
  }
});

/**
 * POST /api/study-sessions/start
 * Start a new study session. Prevents duplicate or overlapping active sessions.
 */
router.post("/start", requireAuth, async (req, res) => {
  const { assignmentId, courseId, notes } = req.body;
  const userId = req.user.id;

  try {
    // 1. Guard against duplicate / overlapping active sessions
    const existing = await prisma.studySession.findFirst({
      where: {
        userId,
        status: { in: ["ACTIVE", "PAUSED"] },
      },
    });

    if (existing) {
      return res.status(400).json({
        error: "A study session is already active or paused. Please end or cancel it before starting a new one.",
        activeSessionId: existing.id,
      });
    }

    // 2. Resolve Course ID if assignmentId provided
    let resolvedCourseId = courseId || null;
    if (assignmentId) {
      const asg = await prisma.assignment.findFirst({
        where: { id: assignmentId, userId },
      });
      if (asg) {
        if (!resolvedCourseId) resolvedCourseId = asg.courseId;
        // If assignment does not have startedAt, set it now
        if (!asg.startedAt) {
          await prisma.assignment.update({
            where: { id: assignmentId },
            data: { startedAt: new Date() },
          });
        }
      }
    }

    const now = new Date();
    const session = await prisma.studySession.create({
      data: {
        userId,
        assignmentId: assignmentId || null,
        courseId: resolvedCourseId,
        startedAt: now,
        lastResumedAt: now,
        durationSeconds: 0,
        status: "ACTIVE",
        notes: notes || null,
      },
      include: {
        assignment: { select: { id: true, title: true } },
        course: { select: { id: true, name: true, code: true } },
      },
    });

    // Emit Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.to(userId).emit("study_session:started", session);
      io.to(userId).emit("productivity:updated");
    }

    res.status(201).json({
      success: true,
      message: "Study session started",
      session,
    });
  } catch (err) {
    console.error("[StudySession Start Error]:", err);
    res.status(500).json({ error: "Failed to start study session" });
  }
});

/**
 * POST /api/study-sessions/:id/pause
 * Pause an active session, calculating and storing accumulated duration so far.
 */
router.post("/:id/pause", requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const session = await prisma.studySession.findFirst({
      where: { id, userId, status: "ACTIVE" },
    });

    if (!session) {
      return res.status(404).json({ error: "Active study session not found" });
    }

    const now = new Date();
    const activeStart = session.lastResumedAt || session.startedAt;
    const additionalSeconds = Math.max(0, Math.floor((now.getTime() - new Date(activeStart).getTime()) / 1000));
    const newDurationSeconds = (session.durationSeconds || 0) + additionalSeconds;

    const updated = await prisma.studySession.update({
      where: { id },
      data: {
        status: "PAUSED",
        durationSeconds: newDurationSeconds,
        lastResumedAt: null,
      },
      include: {
        assignment: { select: { id: true, title: true } },
        course: { select: { id: true, name: true, code: true } },
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(userId).emit("study_session:paused", updated);
      io.to(userId).emit("productivity:updated");
    }

    res.json({
      success: true,
      message: "Study session paused",
      session: updated,
    });
  } catch (err) {
    console.error("[StudySession Pause Error]:", err);
    res.status(500).json({ error: "Failed to pause study session" });
  }
});

/**
 * POST /api/study-sessions/:id/resume
 * Resume a paused study session.
 */
router.post("/:id/resume", requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const session = await prisma.studySession.findFirst({
      where: { id, userId, status: "PAUSED" },
    });

    if (!session) {
      return res.status(404).json({ error: "Paused study session not found" });
    }

    const now = new Date();
    const updated = await prisma.studySession.update({
      where: { id },
      data: {
        status: "ACTIVE",
        lastResumedAt: now,
      },
      include: {
        assignment: { select: { id: true, title: true } },
        course: { select: { id: true, name: true, code: true } },
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(userId).emit("study_session:resumed", updated);
      io.to(userId).emit("productivity:updated");
    }

    res.json({
      success: true,
      message: "Study session resumed",
      session: updated,
    });
  } catch (err) {
    console.error("[StudySession Resume Error]:", err);
    res.status(500).json({ error: "Failed to resume study session" });
  }
});

/**
 * POST /api/study-sessions/:id/end
 * End a study session, finalizing duration and recording as COMPLETED.
 */
router.post("/:id/end", requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const session = await prisma.studySession.findFirst({
      where: { id, userId, status: { in: ["ACTIVE", "PAUSED"] } },
    });

    if (!session) {
      return res.status(404).json({ error: "Active or paused study session not found" });
    }

    const now = new Date();
    let finalDurationSeconds = session.durationSeconds || 0;

    // If it was ACTIVE, add time from lastResumedAt to now
    if (session.status === "ACTIVE" && session.lastResumedAt) {
      const elapsed = Math.max(0, Math.floor((now.getTime() - new Date(session.lastResumedAt).getTime()) / 1000));
      finalDurationSeconds += elapsed;
    }

    const updated = await prisma.studySession.update({
      where: { id },
      data: {
        status: "COMPLETED",
        endedAt: now,
        durationSeconds: finalDurationSeconds,
        lastResumedAt: null,
      },
      include: {
        assignment: { select: { id: true, title: true } },
        course: { select: { id: true, name: true, code: true } },
      },
    });

    // If attached to an assignment, update assignment actualMinutes
    if (updated.assignmentId && finalDurationSeconds > 60) {
      const sessionMins = Math.round(finalDurationSeconds / 60);
      const asg = await prisma.assignment.findUnique({
        where: { id: updated.assignmentId },
        select: { actualMinutes: true },
      });
      if (asg) {
        await prisma.assignment.update({
          where: { id: updated.assignmentId },
          data: {
            actualMinutes: (asg.actualMinutes || 0) + sessionMins,
          },
        });
      }
    }

    const io = req.app.get("io");
    if (io) {
      io.to(userId).emit("study_session:completed", updated);
      io.to(userId).emit("productivity:updated");
    }

    res.json({
      success: true,
      message: "Study session completed and recorded",
      session: updated,
    });
  } catch (err) {
    console.error("[StudySession End Error]:", err);
    res.status(500).json({ error: "Failed to end study session" });
  }
});

/**
 * POST /api/study-sessions/:id/cancel
 * Cancel an active/paused session without counting towards productivity stats.
 */
router.post("/:id/cancel", requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const session = await prisma.studySession.findFirst({
      where: { id, userId, status: { in: ["ACTIVE", "PAUSED"] } },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const updated = await prisma.studySession.update({
      where: { id },
      data: {
        status: "CANCELLED",
        endedAt: new Date(),
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(userId).emit("study_session:cancelled", updated);
      io.to(userId).emit("productivity:updated");
    }

    res.json({
      success: true,
      message: "Study session cancelled",
    });
  } catch (err) {
    console.error("[StudySession Cancel Error]:", err);
    res.status(500).json({ error: "Failed to cancel study session" });
  }
});

export default router;

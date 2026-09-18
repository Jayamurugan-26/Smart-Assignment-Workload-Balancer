import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import prisma from "../prisma.js";

const router = express.Router();

/**
 * GET /api/profile
 * Retrieves student profile, academic metadata, and real DB calculated statistics.
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        courses: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Real DB-derived statistics
    const allAssignments = await prisma.assignment.findMany({
      where: { userId, deletedAt: null },
      select: { id: true, status: true, dueDate: true }
    });

    const now = new Date();
    const totalAssignments = allAssignments.length;
    const completedAssignments = allAssignments.filter(a => a.status === "COMPLETED").length;
    const pendingAssignments = allAssignments.filter(a => a.status !== "COMPLETED").length;
    const overdueAssignments = allAssignments.filter(a => a.status !== "COMPLETED" && a.dueDate && new Date(a.dueDate) < now).length;
    const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    res.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name || "Student",
        email: user.email,
        avatar: user.avatar,
        googleId: user.googleId,
        isConnectedToGoogle: Boolean(user.accessToken && user.email !== "demo.student@university.edu"),
        department: user.department || "Computer Science & Engineering",
        academicYear: user.academicYear || "3rd Year",
        semester: user.semester || "Semester 5",
        studentIdNumber: user.studentIdNumber || "STU-2026-881",
        weekdayCapacity: user.weekdayCapacity,
        weekendCapacity: user.weekendCapacity,
        themePreference: user.themePreference || "light",
        coursesCount: user.courses.length,
        createdAt: user.createdAt,
      },
      stats: {
        totalAssignments,
        completedAssignments,
        pendingAssignments,
        overdueAssignments,
        completionRate,
      }
    });
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ error: "Failed to fetch student profile", details: err.message });
  }
});

/**
 * PATCH /api/profile
 * Updates student academic details and preferences.
 */
router.patch("/", requireAuth, async (req, res) => {
  const {
    name,
    department,
    academicYear,
    semester,
    studentIdNumber,
    weekdayCapacity,
    weekendCapacity,
    themePreference
  } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(department !== undefined ? { department } : {}),
        ...(academicYear !== undefined ? { academicYear } : {}),
        ...(semester !== undefined ? { semester } : {}),
        ...(studentIdNumber !== undefined ? { studentIdNumber } : {}),
        ...(weekdayCapacity !== undefined ? { weekdayCapacity: parseFloat(weekdayCapacity) } : {}),
        ...(weekendCapacity !== undefined ? { weekendCapacity: parseFloat(weekendCapacity) } : {}),
        ...(themePreference !== undefined ? { themePreference } : {}),
      }
    });

    res.json({
      success: true,
      profile: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar,
        department: updated.department,
        academicYear: updated.academicYear,
        semester: updated.semester,
        studentIdNumber: updated.studentIdNumber,
        weekdayCapacity: updated.weekdayCapacity,
        weekendCapacity: updated.weekendCapacity,
        themePreference: updated.themePreference,
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile", details: err.message });
  }
});

export default router;

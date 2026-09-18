import prisma from "../prisma.js";

/**
 * Creates and broadcasts a notification to a specific user
 */
export async function createNotification({ userId, title, message, type = "SYSTEM", metadata = null, io = null }) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    if (io) {
      io.to(userId).emit("notification:new", { notification });
    }

    return notification;
  } catch (err) {
    console.error("Failed to create notification:", err.message);
    return null;
  }
}

export async function notifyClassroomSync({ userId, syncedCount, io }) {
  return createNotification({
    userId,
    title: "Classroom Synced",
    message: syncedCount > 0 
      ? `Synchronized ${syncedCount} assignment(s) and materials from Google Classroom.` 
      : "Google Classroom is completely up to date. No new coursework detected.",
    type: "SYNC",
    metadata: { syncedCount },
    io,
  });
}

export async function notifyAssignmentCompleted({ userId, assignment, io }) {
  return createNotification({
    userId,
    title: "Assignment Completed! 🎉",
    message: `You marked "${assignment.title}" as completed. Great job!`,
    type: "COMPLETED",
    metadata: { assignmentId: assignment.id },
    io,
  });
}

export async function notifyDocumentAnalyzed({ userId, fileName, sessionId, io }) {
  return createNotification({
    userId,
    title: "AI Analysis Ready",
    message: `NEXYRA has completed the multimodal analysis for "${fileName}".`,
    type: "ANALYSIS",
    metadata: { sessionId, fileName },
    io,
  });
}

export async function notifyHighRiskDeadline({ userId, assignment, io }) {
  return createNotification({
    userId,
    title: `⚠️ High Risk: ${assignment.title}`,
    message: `Deadline is approaching with significant workload (${(assignment.estimatedMinutes / 60).toFixed(1)}h estimated). Review the AI study plan.`,
    type: "RISK",
    metadata: { assignmentId: assignment.id },
    io,
  });
}

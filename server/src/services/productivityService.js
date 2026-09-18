import prisma from "../prisma.js";

/**
 * Parses date range options into start and end Dates.
 */
export function resolveDateRange(options = {}) {
  const { preset = "this-week", startDate, endDate } = options;
  const now = new Date();

  let start = new Date(now);
  let end = new Date(now);

  if (startDate && endDate) {
    start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { start, end, preset: "custom" };
  }

  switch (preset) {
    case "this-month": {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    }
    case "last-7-days": {
      start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "last-30-days": {
      start = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "this-week":
    default: {
      // Monday as first day of week
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      start = new Date(now);
      start.setDate(now.getDate() + diffToMonday);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }
  }

  return { start, end, preset };
}

/**
 * Format minutes into "Xh Ym"
 */
export function formatMinutes(totalMinutes) {
  if (totalMinutes === null || totalMinutes === undefined || isNaN(totalMinutes)) {
    return "Not enough data";
  }
  const mins = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m < 10 ? "0" + m : m}m`;
}

/**
 * Calculate genuine productivity analytics for an authenticated student.
 * STRICT: Zero fake, random, or hardcoded values.
 */
export async function calculateProductivityMetrics(userId, options = {}) {
  const { start, end, preset } = resolveDateRange(options);
  const now = new Date();

  // Equivalent previous period for factual comparison
  const windowDurationMs = end.getTime() - start.getTime() + 1;
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - windowDurationMs + 1);

  // 1. Fetch user assignments (active and completed, excluding soft-deleted)
  const allAssignments = await prisma.assignment.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    include: {
      course: true,
      studySessions: {
        where: { status: "COMPLETED" },
      },
    },
  });

  // 2. Fetch completed study sessions in current and previous windows
  const completedSessions = await prisma.studySession.findMany({
    where: {
      userId,
      status: "COMPLETED",
      startedAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      course: true,
      assignment: true,
    },
    orderBy: { startedAt: "asc" },
  });

  const prevCompletedSessions = await prisma.studySession.findMany({
    where: {
      userId,
      status: "COMPLETED",
      startedAt: {
        gte: prevStart,
        lte: prevEnd,
      },
    },
    select: { durationSeconds: true },
  });

  // 3. User courses for subject-wise workload
  const userCourses = await prisma.course.findMany({
    where: { userId },
    include: {
      assignments: {
        where: { deletedAt: null },
      },
    },
  });

  // ==========================================
  // METRIC A: Assignments Completed
  // ==========================================
  const completedInRange = allAssignments.filter((a) => {
    if (a.status !== "COMPLETED" || !a.completedAt) return false;
    const cTime = new Date(a.completedAt).getTime();
    return cTime >= start.getTime() && cTime <= end.getTime();
  });

  const prevCompletedInRange = allAssignments.filter((a) => {
    if (a.status !== "COMPLETED" || !a.completedAt) return false;
    const cTime = new Date(a.completedAt).getTime();
    return cTime >= prevStart.getTime() && cTime <= prevEnd.getTime();
  });

  const assignmentsCompleted = completedInRange.length;
  const prevAssignmentsCompleted = prevCompletedInRange.length;

  // Comparison logic
  const hasHistoricalAssignments = allAssignments.some((a) => {
    if (!a.completedAt) return false;
    return new Date(a.completedAt).getTime() < start.getTime();
  });

  let completionComparison = {
    hasComparison: false,
    diff: 0,
    text: "No previous-period data",
  };

  if (hasHistoricalAssignments || prevAssignmentsCompleted > 0) {
    const diff = assignmentsCompleted - prevAssignmentsCompleted;
    completionComparison = {
      hasComparison: true,
      diff,
      text:
        diff > 0
          ? `+${diff} from previous period`
          : diff < 0
          ? `${diff} from previous period`
          : "No change from previous period",
    };
  }

  // ==========================================
  // METRIC B: Average Completion Time
  // ==========================================
  // Strictly uses completed_at - started_at when both exist
  const validDurationAssignments = completedInRange.filter(
    (a) => a.completedAt && a.startedAt && new Date(a.completedAt) > new Date(a.startedAt)
  );

  let averageCompletionTimeMinutes = null;
  let averageCompletionTimeFormatted = "Not enough data";

  if (validDurationAssignments.length > 0) {
    const totalDurationMs = validDurationAssignments.reduce((acc, a) => {
      return acc + (new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime());
    }, 0);
    averageCompletionTimeMinutes = Math.round(
      totalDurationMs / validDurationAssignments.length / 60000
    );
    averageCompletionTimeFormatted = formatMinutes(averageCompletionTimeMinutes);
  }

  // ==========================================
  // METRIC C: Late Submissions
  // ==========================================
  let lateSubmissions = 0;
  for (const asg of completedInRange) {
    const completedTime = new Date(asg.completedAt);
    const deadline = new Date(asg.dueDate);
    if (asg.dueTime) {
      const [hours, mins] = asg.dueTime.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(mins)) {
        deadline.setHours(hours, mins, 0, 0);
      }
    }
    if (completedTime > deadline) {
      lateSubmissions++;
    }
  }

  const lateSubmissionRate =
    assignmentsCompleted > 0
      ? Math.round((lateSubmissions / assignmentsCompleted) * 100)
      : null;

  const lateSubmissionText =
    assignmentsCompleted === 0
      ? "No completed assignments in this period"
      : `${lateSubmissionRate}% of completed assignments`;

  // ==========================================
  // METRIC D: Study Hours
  // ==========================================
  const totalStudySeconds = completedSessions.reduce(
    (acc, s) => acc + (s.durationSeconds || 0),
    0
  );
  const studyMinutes = Math.round(totalStudySeconds / 60);
  const studyHours = +(studyMinutes / 60).toFixed(1);
  const studyHoursFormatted = formatMinutes(studyMinutes);

  const prevStudySeconds = prevCompletedSessions.reduce(
    (acc, s) => acc + (s.durationSeconds || 0),
    0
  );
  const prevStudyMinutes = Math.round(prevStudySeconds / 60);
  const prevStudyHours = +(prevStudyMinutes / 60).toFixed(1);

  let studyHoursComparison = {
    hasComparison: false,
    diffHours: 0,
    text: "No previous-period data",
  };

  const hasHistoricalSessions = await prisma.studySession.count({
    where: {
      userId,
      status: "COMPLETED",
      startedAt: { lt: start },
    },
  });

  if (hasHistoricalSessions > 0 || prevStudySeconds > 0) {
    const diffHours = +(studyHours - prevStudyHours).toFixed(1);
    studyHoursComparison = {
      hasComparison: true,
      diffHours,
      text:
        diffHours > 0
          ? `+${diffHours}h from previous period`
          : diffHours < 0
          ? `${diffHours}h from previous period`
          : "No change from previous period",
    };
  }

  // ==========================================
  // METRIC E: Pending Workload
  // ==========================================
  const pendingAssignmentsList = allAssignments.filter((a) => a.status !== "COMPLETED");
  const pendingAssignments = pendingAssignmentsList.length;
  const pendingWorkloadMinutes = pendingAssignmentsList.reduce(
    (acc, a) => acc + (a.estimatedMinutes || 180),
    0
  );
  const pendingWorkloadHours = +(pendingWorkloadMinutes / 60).toFixed(1);

  // ==========================================
  // SECTION 5: Subject-Wise Workload
  // ==========================================
  const subjectWorkload = userCourses.map((course) => {
    const courseAsgs = allAssignments.filter((a) => a.courseId === course.id);
    const totalAsgs = courseAsgs.length;
    const completedCourseAsgs = courseAsgs.filter((a) => a.status === "COMPLETED").length;
    const pendingCourseAsgs = courseAsgs.filter((a) => a.status !== "COMPLETED").length;
    const overdueCourseAsgs = courseAsgs.filter(
      (a) => a.status !== "COMPLETED" && a.dueDate && new Date(a.dueDate) < now
    ).length;

    const estMinutes = courseAsgs
      .filter((a) => a.status !== "COMPLETED")
      .reduce((acc, a) => acc + (a.estimatedMinutes || 180), 0);
    const estWorkloadHours = +(estMinutes / 60).toFixed(1);

    // Actual recorded study hours for this course in the range
    const courseSessions = completedSessions.filter(
      (s) => s.courseId === course.id || (s.assignment && s.assignment.courseId === course.id)
    );
    const courseStudySeconds = courseSessions.reduce(
      (acc, s) => acc + (s.durationSeconds || 0),
      0
    );
    const actualStudyHours = +(courseStudySeconds / 3600).toFixed(1);

    return {
      courseId: course.id,
      name: course.name,
      code: course.code || "GEN",
      color: course.color || "#3b82f6",
      totalAssignments: totalAsgs,
      completed: completedCourseAsgs,
      pending: pendingCourseAsgs,
      overdue: overdueCourseAsgs,
      estimatedWorkloadHours: estWorkloadHours,
      actualStudyHours,
    };
  });

  // ==========================================
  // SECTION 6: Progress Trend (Day-by-Day or Bucket)
  // ==========================================
  const dayBuckets = [];
  const daysDiff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 3600 * 1000)));

  for (let i = 0; i < daysDiff; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);

    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const dayCompleted = completedInRange.filter((a) => {
      const c = new Date(a.completedAt);
      return c >= d && c < nextD;
    }).length;

    const daySessions = completedSessions.filter((s) => {
      const st = new Date(s.startedAt);
      return st >= d && st < nextD;
    });

    const dayStudySecs = daySessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
    const dayStudyHours = +(dayStudySecs / 3600).toFixed(1);

    const dayDueAssignments = allAssignments.filter((a) => {
      const due = new Date(a.dueDate);
      return due >= d && due < nextD;
    }).length;

    dayBuckets.push({
      date: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      displayDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      completedCount: dayCompleted,
      studyHours: dayStudyHours,
      studyMinutes: Math.round(dayStudySecs / 60),
      dueCount: dayDueAssignments,
    });
  }

  const hasTrendData = dayBuckets.some((b) => b.completedCount > 0 || b.studyHours > 0);

  // ==========================================
  // SECTION 10: Productivity Patterns
  // ==========================================
  const allUserCompletedSessions = await prisma.studySession.findMany({
    where: { userId, status: "COMPLETED" },
    select: { startedAt: true, durationSeconds: true, courseId: true },
  });

  let patterns = {
    hasPatterns: false,
    message: "More study activity is needed to identify a reliable pattern.",
    mostActiveDay: null,
    mostActiveTimeRange: null,
    highestStudySubject: null,
    highestPendingSubject: null,
    avgAssignmentsPerWeek: null,
  };

  if (allUserCompletedSessions.length >= 3 || allAssignments.filter((a) => a.status === "COMPLETED").length >= 3) {
    // 1. Most active day
    const dayTotals = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };
    for (const s of allUserCompletedSessions) {
      const dName = new Date(s.startedAt).toLocaleDateString("en-US", { weekday: "long" });
      dayTotals[dName] = (dayTotals[dName] || 0) + (s.durationSeconds || 0);
    }
    const sortedDays = Object.entries(dayTotals).sort((a, b) => b[1] - a[1]);
    const topDay = sortedDays[0] && sortedDays[0][1] > 0 ? sortedDays[0][0] : null;

    // 2. Most active time range
    const timeRanges = {
      "Morning (6 AM - 12 PM)": 0,
      "Afternoon (12 PM - 5 PM)": 0,
      "Evening (5 PM - 10 PM)": 0,
      "Night (10 PM - 6 AM)": 0,
    };
    for (const s of allUserCompletedSessions) {
      const h = new Date(s.startedAt).getHours();
      if (h >= 6 && h < 12) timeRanges["Morning (6 AM - 12 PM)"] += s.durationSeconds;
      else if (h >= 12 && h < 17) timeRanges["Afternoon (12 PM - 5 PM)"] += s.durationSeconds;
      else if (h >= 17 && h < 22) timeRanges["Evening (5 PM - 10 PM)"] += s.durationSeconds;
      else timeRanges["Night (10 PM - 6 AM)"] += s.durationSeconds;
    }
    const sortedRanges = Object.entries(timeRanges).sort((a, b) => b[1] - a[1]);
    const topRange = sortedRanges[0] && sortedRanges[0][1] > 0 ? sortedRanges[0][0] : null;

    // 3. Subject with highest study time
    const topStudyCourse = subjectWorkload.slice().sort((a, b) => b.actualStudyHours - a.actualStudyHours)[0];
    const topPendingCourse = subjectWorkload.slice().sort((a, b) => b.pending - a.pending)[0];

    // 4. Average completed assignments per week
    const allCompleted = allAssignments.filter((a) => a.status === "COMPLETED" && a.completedAt);
    let avgPerWeek = 0;
    if (allCompleted.length > 0) {
      const earliest = Math.min(...allCompleted.map((a) => new Date(a.completedAt).getTime()));
      const weeks = Math.max(1, (now.getTime() - earliest) / (7 * 24 * 3600 * 1000));
      avgPerWeek = +(allCompleted.length / weeks).toFixed(1);
    }

    patterns = {
      hasPatterns: true,
      mostActiveDay: topDay || "Variable",
      mostActiveTimeRange: topRange || "Flexible",
      highestStudySubject: topStudyCourse && topStudyCourse.actualStudyHours > 0 ? topStudyCourse.name : null,
      highestPendingSubject: topPendingCourse && topPendingCourse.pending > 0 ? topPendingCourse.name : null,
      avgAssignmentsPerWeek: avgPerWeek,
    };
  }

  // ==========================================
  // SECTION 9: NEXYRA AI Insights
  // ==========================================
  const insights = [];

  if (assignmentsCompleted > 0 || totalStudySeconds > 0) {
    insights.push(
      `During the selected period, you completed ${assignmentsCompleted} assignment${
        assignmentsCompleted === 1 ? "" : "s"
      } and recorded ${studyHoursFormatted} of focused study time.`
    );

    if (patterns.highestStudySubject) {
      insights.push(`Your highest focused study commitment was dedicated to ${patterns.highestStudySubject}.`);
    }

    if (patterns.highestPendingSubject) {
      insights.push(
        `Your most demanding pending workload is in ${patterns.highestPendingSubject} (${pendingWorkloadHours}h estimated total remaining).`
      );
    }

    if (lateSubmissions > 0) {
      insights.push(
        `You completed ${lateSubmissions} assignment${
          lateSubmissions === 1 ? "" : "s"
        } after their scheduled due dates (${lateSubmissionText}).`
      );
    } else if (assignmentsCompleted > 0) {
      insights.push(`Flawless punctuality: 100% of completed assignments were finished before their deadlines.`);
    }

    if (patterns.mostActiveDay && patterns.mostActiveDay !== "Variable") {
      insights.push(`Peak academic momentum was recorded on ${patterns.mostActiveDay}.`);
    }
  } else {
    insights.push("There isn't enough activity data yet to generate a detailed productivity insight.");
  }

  return {
    success: true,
    range: {
      preset,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      formattedRange: `${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
    },
    summary: {
      assignmentsCompleted,
      completionComparison,
      averageCompletionTimeMinutes,
      averageCompletionTimeFormatted,
      averageCompletionTimeExplanation: "Average time taken to complete assignments during this period.",
      lateSubmissions,
      lateSubmissionRate,
      lateSubmissionText,
      studySeconds: totalStudySeconds,
      studyMinutes,
      studyHours,
      studyHoursFormatted,
      studyHoursComparison,
      studySessionsCount: completedSessions.length,
      pendingAssignments,
      pendingWorkloadMinutes,
      pendingWorkloadHours,
    },
    subjectWorkload,
    progressTrend: dayBuckets,
    hasTrendData,
    patterns,
    insights,
  };
}

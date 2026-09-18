import { google } from "googleapis";
import { getAuthenticatedClient } from "./googleAuthService.js";
import prisma from "../prisma.js";

// Mock student commitments (lectures, labs, club) to detect calendar collisions
export function getMockBusyEvents(startDate, endDate) {
  const events = [];
  const curr = new Date(startDate);
  curr.setHours(0, 0, 0, 0);

  const end = new Date(endDate);

  while (curr <= end) {
    const day = curr.getDay(); // 0 = Sun, 6 = Sat
    if (day >= 1 && day <= 5) {
      // Mon - Fri Morning Lecture: 09:00 - 11:30
      const l1Start = new Date(curr);
      l1Start.setHours(9, 0, 0, 0);
      const l1End = new Date(curr);
      l1End.setHours(11, 30, 0, 0);
      events.push({
        id: `mock-lec1-${curr.toISOString().slice(0, 10)}`,
        title: "University Core Lecture",
        startTime: l1Start,
        endTime: l1End,
        type: "CLASS",
      });

      // Mon, Wed, Fri Afternoon Lab: 14:00 - 16:30
      if (day === 1 || day === 3 || day === 5) {
        const l2Start = new Date(curr);
        l2Start.setHours(14, 0, 0, 0);
        const l2End = new Date(curr);
        l2End.setHours(16, 30, 0, 0);
        events.push({
          id: `mock-lab-${curr.toISOString().slice(0, 10)}`,
          title: "Engineering Lab Session",
          startTime: l2Start,
          endTime: l2End,
          type: "LAB",
        });
      }
    }

    curr.setDate(curr.getDate() + 1);
  }

  return events;
}

export async function fetchCalendarEvents(user, timeMin, timeMax) {
  let isUsingMock = false;
  let events = [];

  try {
    if (!user.accessToken || user.email === "demo.student@university.edu") {
      isUsingMock = true;
    } else {
      const auth = await getAuthenticatedClient(user);
      const calendar = google.calendar({ version: "v3", auth });

      const res = await calendar.events.list({
        calendarId: "primary",
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      events = (res.data.items || []).map(item => ({
        id: item.id,
        title: item.summary,
        description: item.description,
        startTime: new Date(item.start.dateTime || item.start.date),
        endTime: new Date(item.end.dateTime || item.end.date),
        type: "GOOGLE_CALENDAR"
      }));
    }
  } catch (err) {
    console.warn("Calendar API call failed, using mock schedule:", err.message);
    isUsingMock = true;
  }

  if (isUsingMock) {
    events = getMockBusyEvents(timeMin, timeMax);
  }

  // Include active StudyBlocks from database (excluding deleted assignments)
  const studyBlocks = await prisma.studyBlock.findMany({
    where: {
      userId: user.id,
      startTime: { gte: timeMin },
      endTime: { lte: timeMax },
      assignment: {
        deletedAt: null
      }
    },
    include: { assignment: true, microTasks: true }
  });

  const formattedStudyBlocks = studyBlocks.map(sb => ({
    id: sb.id,
    googleEventId: sb.googleEventId,
    title: `[Study Block] ${sb.title}`,
    assignmentTitle: sb.assignment?.title,
    assignmentId: sb.assignmentId,
    startTime: sb.startTime,
    endTime: sb.endTime,
    durationHours: sb.durationHours,
    isSyncedToCalendar: sb.isSyncedToCalendar,
    type: "STUDY_BLOCK",
    microTasks: sb.microTasks
  }));

  return { events: [...events, ...formattedStudyBlocks], isUsingMock };
}

export async function syncStudyBlockToGoogleCalendar(user, studyBlockId) {
  const sb = await prisma.studyBlock.findUnique({
    where: { id: studyBlockId },
    include: { assignment: true }
  });

  if (!sb) throw new Error("Study block not found");

  let googleEventId = null;

  if (user.accessToken && user.email !== "demo.student@university.edu") {
    try {
      const auth = await getAuthenticatedClient(user);
      const calendar = google.calendar({ version: "v3", auth });

      const event = {
        summary: `📚 Study Block: ${sb.title}`,
        description: `Workload-balanced session for: ${sb.assignment.title}\nAllocated: ${sb.durationHours}h.\nAuto-scheduled by Smart Assignment Workload Balancer.`,
        start: { dateTime: sb.startTime.toISOString() },
        end: { dateTime: sb.endTime.toISOString() },
        colorId: "9",
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 15 },
          ]
        }
      };

      if (sb.googleEventId) {
        const updated = await calendar.events.update({
          calendarId: "primary",
          eventId: sb.googleEventId,
          requestBody: event,
        });
        googleEventId = updated.data.id;
      } else {
        const created = await calendar.events.insert({
          calendarId: "primary",
          requestBody: event,
        });
        googleEventId = created.data.id;
      }
    } catch (err) {
      console.warn("Could not sync event to Google Calendar:", err.message);
    }
  }

  const updatedSb = await prisma.studyBlock.update({
    where: { id: studyBlockId },
    data: {
      googleEventId: googleEventId || `demo-event-${Date.now()}`,
      isSyncedToCalendar: true,
    }
  });

  return updatedSb;
}
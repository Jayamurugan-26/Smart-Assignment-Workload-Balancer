import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { fetchCalendarEvents, syncStudyBlockToGoogleCalendar } from "../services/calendarService.js";

const router = express.Router();

/**
 * GET /api/calendar/events
 * Get combined student schedule (classes, commitments, and workload study blocks)
 */
router.get("/events", requireAuth, async (req, res) => {
  const { start, end } = req.query;

  const timeMin = start ? new Date(start) : new Date();
  const timeMax = end ? new Date(end) : new Date(Date.now() + 14 * 24 * 3600 * 1000);

  try {
    const result = await fetchCalendarEvents(req.user, timeMin, timeMax);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch calendar schedule", details: err.message });
  }
});

/**
 * POST /api/calendar/sync-block/:id
 * Sync individual study session block to Google Calendar
 */
router.post("/sync-block/:id", requireAuth, async (req, res) => {
  try {
    const syncedBlock = await syncStudyBlockToGoogleCalendar(req.user, req.params.id);
    res.json({
      success: true,
      message: "Study block synced to Google Calendar",
      studyBlock: syncedBlock,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to sync to Google Calendar", details: err.message });
  }
});

export default router;
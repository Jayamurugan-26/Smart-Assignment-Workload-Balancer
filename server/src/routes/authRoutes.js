import express from "express";
import { getGoogleAuthUrl, handleGoogleCallback, getOrCreateDemoUser } from "../services/googleAuthService.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import prisma from "../prisma.js";

const router = express.Router();

// Get Google OAuth Redirect URL
router.get("/google/url", (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback";

    const isConfigured =
      Boolean(clientId) &&
      clientId !== "your_google_client_id_here" &&
      Boolean(clientSecret) &&
      clientSecret !== "your_google_client_secret_here";

    const url = getGoogleAuthUrl();
    res.json({
      configured: isConfigured,
      url,
      redirectUri,
      clientId: isConfigured ? clientId : null
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate Google OAuth URL", details: err.message });
  }
});

// Google OAuth Callback
router.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const { user, token } = await handleGoogleCallback(code);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}?token=${token}&userId=${user.id}`);
  } catch (err) {
    console.error("Google Auth error:", err);
    res.status(500).json({ error: "Authentication failed", details: err.message });
  }
});

// Demo Student Login (Instant zero-friction testing)
router.post("/demo", async (req, res) => {
  try {
    const { user, token } = await getOrCreateDemoUser();
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Demo login failed", details: err.message });
  }
});

// Current User Profile
router.get("/me", requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      weekdayCapacity: req.user.weekdayCapacity,
      weekendCapacity: req.user.weekendCapacity,
      isConnectedToGoogle: Boolean(req.user.accessToken),
    }
  });
});

// Update Workload Capacity Settings
router.put("/capacity", requireAuth, async (req, res) => {
  const { weekdayCapacity, weekendCapacity } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        weekdayCapacity: weekdayCapacity ? parseFloat(weekdayCapacity) : req.user.weekdayCapacity,
        weekendCapacity: weekendCapacity ? parseFloat(weekendCapacity) : req.user.weekendCapacity,
      }
    });

    res.json({
      success: true,
      weekdayCapacity: updated.weekdayCapacity,
      weekendCapacity: updated.weekendCapacity,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update capacity", details: err.message });
  }
});

export default router;
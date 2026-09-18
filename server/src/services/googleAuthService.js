import { google } from "googleapis";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me",
  "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/drive.readonly",
];

export function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback";

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGoogleAuthUrl() {
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
}

export async function handleGoogleCallback(code) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data: profile } = await oauth2.userinfo.get();

  let user = await prisma.user.findUnique({
    where: { email: profile.email },
  });

  const tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: profile.id,
        name: profile.name,
        avatar: profile.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || user.refreshToken,
        tokenExpiry,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        avatar: profile.picture,
        googleId: profile.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry,
        weekdayCapacity: 4.0,
        weekendCapacity: 6.0,
      },
    });
  }

  const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";
  const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: "7d" });

  return { user, token };
}

export async function getAuthenticatedClient(user) {
  const oauth2Client = getOAuthClient();

  if (!user.accessToken) {
    throw new Error("No Google access token found for user");
  }

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
    expiry_date: user.tokenExpiry ? new Date(user.tokenExpiry).getTime() : undefined,
  });

  oauth2Client.on("tokens", async (newTokens) => {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken: newTokens.access_token,
        ...(newTokens.refresh_token && { refreshToken: newTokens.refresh_token }),
        tokenExpiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
      },
    });
  });

  return oauth2Client;
}

export async function getOrCreateDemoUser() {
  const demoEmail = "demo.student@university.edu";
  let user = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Alex Morgan (Demo Student)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        googleId: "demo-google-id-001",
        weekdayCapacity: 4.0,
        weekendCapacity: 6.0,
      },
    });
  }

  const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";
  const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: "7d" });

  return { user, token };
}
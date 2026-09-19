import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import path from "path";
import authRoutes from "./routes/authRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import balancerRoutes from "./routes/balancerRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import productivityRoutes from "./routes/productivityRoutes.js";
import studySessionRoutes from "./routes/studySessionRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (
    origin === clientUrl ||
    origin.includes("localhost") ||
    origin.endsWith(".onrender.com") ||
    origin.endsWith(".vercel.app")
  ) {
    return true;
  }
  return true; // Allow all origins with credentials in production
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, isOriginAllowed(origin)),
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  }
});

// Attach socket.io instance to app for use in routes/services
app.set("io", io);

app.use(cors({
  origin: (origin, callback) => callback(null, isOriginAllowed(origin)),
  credentials: true,
}));

app.use(express.json());

// Socket.IO Room Management
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`[Socket.IO] Socket ${socket.id} joined room for user ${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Friendly Root Endpoint
app.get("/", (req, res) => {
  res.json({
    status: "active",
    message: "Smart Assignment Workload Balancer Backend API is running smoothly!",
    health: "/api/health",
    frontend: clientUrl,
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Smart Assignment Workload Balancer API",
    time: new Date().toISOString(),
    demoMode: process.env.DEMO_MODE === "true",
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/classroom", classroomRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/balancer", balancerRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/analysis-history", historyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/analytics", productivityRoutes);
app.use("/api/study-sessions", studySessionRoutes);

// Static uploads serving
app.use("/uploads", express.static(path.resolve("uploads")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Smart Assignment Workload Balancer server running on port ${PORT}`);
  console.log(`   Client URL: ${clientUrl}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
});
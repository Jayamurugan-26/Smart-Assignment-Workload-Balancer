import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/authMiddleware.js";
import { analyzeDocumentWithGemini } from "../services/geminiService.js";
import { notifyDocumentAnalyzed } from "../services/notificationService.js";
import prisma from "../prisma.js";

const router = express.Router();

// Configure safe local storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve("uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

// File validation filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: PDF, Images (PNG, JPG, WEBP), and Documents.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
});

/**
 * POST /api/documents/upload-analyze
 * Upload a photo or document and run multimodal Gemini analysis.
 */
router.post("/upload-analyze", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded or file type is not supported" });
  }

  const { assignmentId } = req.body;
  const userId = req.user.id;
  const file = req.file;

  try {
    let assignmentContext = null;
    if (assignmentId) {
      const asg = await prisma.assignment.findFirst({
        where: { id: assignmentId, userId },
        include: { course: true }
      });
      if (asg) {
        assignmentContext = {
          title: asg.title,
          course: asg.course?.name,
          dueDate: asg.dueDate,
          description: asg.description,
        };
      }
    }

    // Read file buffer for Gemini analysis
    const buffer = fs.readFileSync(file.path);

    const result = await analyzeDocumentWithGemini({
      buffer,
      mimeType: file.mimetype,
      fileName: file.originalname,
      assignmentContext,
    });

    // Create FileAnalysisSession in DB
    const session = await prisma.fileAnalysisSession.create({
      data: {
        userId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        filePath: file.filename,
        sourceType: "UPLOAD",
        status: "COMPLETED",
        extractedText: result.analysis.extractedTextPreview || null,
        analysisResult: JSON.stringify(result.analysis),
      },
    });

    // Send notification
    const io = req.app.get("io");
    await notifyDocumentAnalyzed({
      userId,
      fileName: file.originalname,
      sessionId: session.id,
      io,
    });

    res.json({
      success: true,
      session,
      analysis: result.analysis,
      modelUsed: result.modelUsed,
    });
  } catch (err) {
    console.error("Document analysis error:", err);
    res.status(500).json({ error: "Document analysis failed", details: err.message });
  }
});

/**
 * POST /api/documents/analyze-attachment
 * Analyzes an existing Google Classroom attachment
 */
router.post("/analyze-attachment", requireAuth, async (req, res) => {
  const { assignmentId, attachmentName, mimeType, extractedText } = req.body;
  const userId = req.user.id;

  try {
    const asg = await prisma.assignment.findFirst({
      where: { id: assignmentId, userId },
      include: { course: true }
    });

    const assignmentContext = asg ? {
      title: asg.title,
      course: asg.course?.name,
      dueDate: asg.dueDate,
      description: asg.description,
    } : null;

    // Analyze using text buffer or extracted description
    const buffer = Buffer.from(extractedText || attachmentName || "Classroom Attachment");
    const result = await analyzeDocumentWithGemini({
      buffer,
      mimeType: mimeType || "application/pdf",
      fileName: attachmentName || "Attachment.pdf",
      assignmentContext,
    });

    const session = await prisma.fileAnalysisSession.create({
      data: {
        userId,
        fileName: attachmentName || "Classroom Attachment",
        fileType: mimeType || "application/pdf",
        sourceType: "CLASSROOM_ATTACHMENT",
        status: "COMPLETED",
        extractedText: extractedText || null,
        analysisResult: JSON.stringify(result.analysis),
      },
    });

    const io = req.app.get("io");
    await notifyDocumentAnalyzed({
      userId,
      fileName: attachmentName || "Attachment",
      sessionId: session.id,
      io,
    });

    res.json({
      success: true,
      session,
      analysis: result.analysis,
      modelUsed: result.modelUsed,
    });
  } catch (err) {
    console.error("Attachment analysis error:", err);
    res.status(500).json({ error: "Attachment analysis failed", details: err.message });
  }
});

export default router;

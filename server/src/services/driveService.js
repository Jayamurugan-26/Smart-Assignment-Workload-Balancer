import { google } from "googleapis";
import { getAuthenticatedClient } from "./googleAuthService.js";
import prisma from "../prisma.js";

export async function getDriveFileDetails(user, fileId) {
  if (!user.accessToken || user.email === "demo.student@university.edu") {
    return {
      id: fileId,
      name: "Sample_Specification.pdf",
      mimeType: "application/pdf",
      webViewLink: "https://drive.google.com/file/d/demo/view",
      extractedText: "Coursework document preview: Detailed instructions, rubrics, and submission guidelines.",
    };
  }

  try {
    const auth = await getAuthenticatedClient(user);
    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, webViewLink, thumbnailLink",
    });

    return res.data;
  } catch (err) {
    console.warn("Drive API call failed, using mock data:", err.message);
    return {
      id: fileId,
      name: "Coursework_Attachment.pdf",
      mimeType: "application/pdf",
      webViewLink: "https://drive.google.com/file/d/demo/view",
      extractedText: "Drive attachment preview. Download the PDF for complete details.",
    };
  }
}
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";

    let userId = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, jwtSecret);
        userId = decoded.userId;
      } catch (e) {
        // Token expired or invalid signature
      }
    }

    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }

    // If user not found (e.g. fresh database on Render or invalid token), fallback to demo student
    if (!user) {
      user = await prisma.user.findFirst({
        where: { email: "demo.student@university.edu" }
      });

      if (!user) {
        const { getOrCreateDemoUser } = await import("../services/googleAuthService.js");
        const resDemo = await getOrCreateDemoUser();
        user = resDemo.user;
      }
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("[Auth Middleware Error]:", err);
    return res.status(401).json({ error: "Authentication failed", details: err.message });
  }
}
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // If in demo mode or no token, fallback to demo student user
      const demoUser = await prisma.user.findFirst({
        where: { email: "demo.student@university.edu" }
      });
      if (demoUser) {
        req.user = demoUser;
        return next();
      }
      return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";
    const decoded = jwt.verify(token, jwtSecret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token", details: err.message });
  }
}
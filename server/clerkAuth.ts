import { clerkMiddleware, getAuth, requireAuth } from "@clerk/express";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

export function setupClerkAuth(app: Express) {
  app.use(clerkMiddleware());
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const auth = getAuth(req);
  
  if (!auth.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  next();
};

export async function syncClerkUser(userId: string, email: string | null, firstName: string | null, lastName: string | null, imageUrl: string | null) {
  await storage.upsertUser({
    id: userId,
    email: email,
    firstName: firstName,
    lastName: lastName,
    profileImageUrl: imageUrl,
  });
}

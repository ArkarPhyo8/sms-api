import { AppError } from "@/errors/app.error";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    schoolId: string;
  };
}
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Access denied. No token provide.", 401));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new AppError("No token provided", 401));
    }

    //verify token
    const decoded = jwt.verify(token, JWT_SECRET as string) as {
      userId: string;
      email: string;
      role: string;
      schoolId: string;
    };

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token has expired.", 401));
    }
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError("Invalid token.", 403));
  }
};

import { AppError } from "@/errors/app.error";
import type { NextFunction, Request, Response } from "express";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

import { AppError } from "@/errors/app.error";
import { prismaError } from "@/errors/prisma.error";
import type { NextFunction, Request, Response } from "express";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error: AppError;
  
  //check prisma error is or not
  const prismaErrors = prismaError(err);
  if (prismaErrors) {
    error = prismaErrors;
  } else if (err instanceof AppError) {
    error = err;
  } else {
    const message = err.message || "Internal Server Error";
    error = new AppError(message, 500);
  }

  //Sever Error (500) from Production
  if (process.env.NODE_ENV === "production" && error.statusCode === 500) {
    console.error("Error:", err);
  }

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

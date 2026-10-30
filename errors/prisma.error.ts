import { Prisma } from "@prisma/client";
import { AppError } from "./app.error";

export const prismaError = (error: unknown): AppError | null => {
  //validation error
  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError("Invalid data provided in request", 400);
  }

  //Known Request Error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        //Unique constraint violation
        const target = error.meta?.target;
        const field = Array.isArray(target) ? target[0] : "Field";
        return new AppError(`${field} already exists`, 400);
      }
      case "P2025": {
        //Record not found
        return new AppError("Record not found", 404);
      }

      case "P2003": {
        //Foreign key constraint violation
        return new AppError(
          "Invalid reference: related record does not exist",
          400,
        );
      }

      default:
        return null;
    }
  }
  return null;
};

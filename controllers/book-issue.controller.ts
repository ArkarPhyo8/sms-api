import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import {
  createBookIssueService,
  updateBookIssueService,
} from "@/services/book-issue.service";
import { createBookService, updateBookService } from "@/services/book.service";
import type { NextFunction, Request, Response } from "express";

// Get All
export const getBookIssue = async (req: Request, res: Response) => {
  try {
    const bookId = req.query.bookId as string | undefined;
    const studentId = req.query.studentId as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder =
      (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    const andConditions: any[] = [];

    if (bookId) {
      andConditions.push({ bookId });
    }

    if (studentId) {
      andConditions.push({ studentId });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const [bookIssue, totalCount] = await prisma.$transaction([
      prisma.bookIssue.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          book: true,
          student: true,
        },
      }),
      prisma.bookIssue.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      message: "Fetched successfully",
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      data: bookIssue,
    });
  } catch (error: any) {
    console.error("Get Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get By ID
export const getBookIssueById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const bookIssue = await prisma.bookIssue.findUnique({
      where: { id: id as string },
    });

    if (!bookIssue) {
      return next(new AppError("Book Issue not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "Fetched successfully", data: bookIssue });
  } catch (error: any) {
    console.error("Get By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create
export const createBookIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { bookId, studentId, dueDate, returnDate, isReturned } = req.body;

    if (!bookId) {
      return next(new AppError("Missing required fields.", 400));
    }
    const newBookIssue = await createBookIssueService({
      bookId,
      studentId,
      dueDate,
      returnDate,
      isReturned,
    });

    return res.status(201).json({
      success: true,
      message: "Created successfully.",
      data: newBookIssue,
    });
  } catch (error: any) {
    console.error("Create Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update
export const updateBookIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { bookId, studentId, dueDate, returnDate, isReturned } = req.body;
    const update = await updateBookIssueService({
      id: id as string,
      bookId,
      studentId,
      dueDate,
      returnDate,
      isReturned,
    });

    return res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: update,
    });
  } catch (error: any) {
    console.error("Update Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete
export const deleteBookIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const bookIssue = await prisma.bookIssue.findUnique({
      where: { id: id as string },
    });

    if (!bookIssue) {
      return next(new AppError("Book Issue not found.", 404));
    }

    await prisma.book.delete({
      where: { id: bookIssue.id },
    });

    return res
      .status(204)
      .json({ success: true, message: "deactivated successfully." });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

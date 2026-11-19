import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import { createBookService, updateBookService } from "@/services/book.service";
import type { NextFunction, Request, Response } from "express";

// Get All
export const getBook = async (req: Request, res: Response) => {
  try {
    const schoolId = req.query.schoolId as string | undefined;
    const search = (req.query.search as string) || "";

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder =
      (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    const andConditions: any[] = [];

    if (schoolId) {
      andConditions.push({ schoolId });
    }

    if (search) {
      andConditions.push({
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const [book, totalCount] = await prisma.$transaction([
      prisma.book.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          school: true,
        },
      }),
      prisma.book.count({
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
      data: book,
    });
  } catch (error: any) {
    console.error("Get Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get By ID
export const getBookById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id: id as string },
    });

    if (!book) {
      return next(new AppError("Book not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "Fetched successfully", data: book });
  } catch (error: any) {
    console.error("Get By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create
export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      schoolId,
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies,
    } = req.body;

    if (!schoolId) {
      return next(new AppError("Missing required fields.", 400));
    }
    const newBook = await createBookService({
      schoolId,
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies,
    });

    return res.status(201).json({
      success: true,
      message: "Created successfully.",
      data: newBook,
    });
  } catch (error: any) {
    console.error("Create Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update
export const updateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      schoolId,
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies,
    } = req.body;
    const update = await updateBookService({
      id: id as string,
      schoolId,
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies,
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
export const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id: id as string },
    });

    if (!book) {
      return next(new AppError("Book not found.", 404));
    }

    await prisma.book.delete({
      where: { id: book.id },
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

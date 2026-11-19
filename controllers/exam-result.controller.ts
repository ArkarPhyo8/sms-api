import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import {
  createExamResultService,
  updateExamResultService,
} from "@/services/exam-result.service";
import type { NextFunction, Request, Response } from "express";

// Get All
export const getExamResult = async (req: Request, res: Response) => {
  try {
    const examId = req.query.examId as string | undefined;
    const studentId = req.query.studentId as string | undefined;
    const search = (req.query.search as string) || "";

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder =
      (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    const andConditions: any[] = [];

    if (examId) {
      andConditions.push({ examId });
    }

    if (studentId) {
      andConditions.push({ studentId });
    }

    if (search) {
      andConditions.push({
        OR: [
          {
            grade: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const [examResult, totalCount] = await prisma.$transaction([
      prisma.examResult.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          exam: true,
          student: true,
        },
      }),
      prisma.examResult.count({
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
      data: examResult,
    });
  } catch (error: any) {
    console.error("Get Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get By ID
export const getExamResultById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const examResult = await prisma.examResult.findUnique({
      where: { id: id as string },
    });

    if (!examResult) {
      return next(new AppError("Exam Result not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "Fetched successfully", data: examResult });
  } catch (error: any) {
    console.error("Get By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create
export const createExamResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { examId, studentId, marksObtained, grade, remarks } = req.body;

    if (!examId || !studentId) {
      return next(new AppError("Missing required fields.", 400));
    }
    const newExamResult = await createExamResultService({
      examId,
      studentId,
      marksObtained,
      grade,
      remarks,
    });

    return res.status(201).json({
      success: true,
      message: "Created successfully.",
      data: newExamResult,
    });
  } catch (error: any) {
    console.error("Create Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update
export const updateExamResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { examId, studentId, marksObtained, grade, remarks } = req.body;
    const update = await updateExamResultService({
      id: id as string,
      examId,
      studentId,
      marksObtained,
      grade,
      remarks,
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
export const deleteExamResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const examResult = await prisma.examResult.findUnique({
      where: { id: id as string },
    });

    if (!examResult) {
      return next(new AppError("Exam Result not found.", 404));
    }

    await prisma.examResult.delete({
      where: { id: examResult.id },
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

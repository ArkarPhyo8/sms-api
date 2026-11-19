import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import {
  createGradeLevelService,
  updateGradeLevelService,
} from "@/services/grade-level.service";
import type { NextFunction, Request, Response } from "express";

// Get All
export const getGradeLevel = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || "";

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder =
      (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            levelNumber: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const [gradeLevel, totalCount] = await prisma.$transaction([
      prisma.gradeLevel.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.gradeLevel.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      message: "Grade Level fetched successfully",
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      data: gradeLevel,
    });
  } catch (error: any) {
    console.error("Get Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get By ID
export const getGradeLevelById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const gradeLevel = await prisma.gradeLevel.findUnique({
      where: { id: id as string },
    });

    if (!gradeLevel) {
      return next(new AppError("Grade Level not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "Grade Level fetched successfully", data: gradeLevel });
  } catch (error: any) {
    console.error("Get By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create
export const createGradeLevel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, levelNumber } = req.body;

    const newGradeLevel = await createGradeLevelService({
      name,
      levelNumber,
    });

    return res.status(201).json({
      success: true,
      message: "Grade level created successfully.",
      data: newGradeLevel,
    });
  } catch (error: any) {
    console.error("Create Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update
export const updateGradeLevel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, levelNumber } = req.body;
    const updatedGradeLevel = await updateGradeLevelService({
      id: id as string,
      name,
      levelNumber,
    });

    return res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updatedGradeLevel,
    });
  } catch (error: any) {
    console.error("Update Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete
export const deleteGradeLevel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const gradeLevel = await prisma.gradeLevel.findUnique({
      where: { id: id as string },
    });

    if (!gradeLevel) {
      return next(new AppError("Grade Level not found.", 404));
    }

    await prisma.gradeLevel.delete({
      where: { id: gradeLevel.id },
    });

    return res
      .status(204)
      .json({
        success: true,
        message: "Grade Level deactivated successfully.",
      });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import {
  createFeeStructureService,
  updateFeeStructureService,
} from "@/services/fee-structure.service";
import type { NextFunction, Request, Response } from "express";

// Get All
export const getFeeStructure = async (req: Request, res: Response) => {
  try {
    const schoolId = req.query.schoolId as string | undefined;
    const gradeLevelId = req.query.gradeLevelId as string | undefined;
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

    if (gradeLevelId) {
      andConditions.push({ gradeLevelId });
    }

    if (search) {
      andConditions.push({
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const [feeStructure, totalCount] = await prisma.$transaction([
      prisma.feeStructure.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          school: true,
          gradeLevel: true,
        },
      }),
      prisma.feeStructure.count({
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
      data: feeStructure,
    });
  } catch (error: any) {
    console.error("Get Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get By ID
export const getFeeStructureById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: id as string },
    });

    if (!feeStructure) {
      return next(new AppError("Fee Structure not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "Fetched successfully", data: feeStructure });
  } catch (error: any) {
    console.error("Get By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create
export const createFeeStructure = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { schoolId, gradeLevelId, name, amount, dueDate } = req.body;

    if (!schoolId || !gradeLevelId) {
      return next(new AppError("Missing required fields.", 400));
    }
    const newFeeStructureResult = await createFeeStructureService({
      schoolId,
      gradeLevelId,
      name,
      amount,
      dueDate,
    });

    return res.status(201).json({
      success: true,
      message: "Created successfully.",
      data: newFeeStructureResult,
    });
  } catch (error: any) {
    console.error("Create Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update
export const updateFeeStructure = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { schoolId, gradeLevelId, name, amount, dueDate } = req.body;
    const update = await updateFeeStructureService({
      id: id as string,
      schoolId,
      gradeLevelId,
      name,
      amount,
      dueDate,
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
export const deleteFeeStructure = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: id as string },
    });

    if (!feeStructure) {
      return next(new AppError("Fee Structure not found.", 404));
    }

    await prisma.feeStructure.delete({
      where: { id: feeStructure.id },
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

import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import {
  createClassService,
  updateClassService,
} from "@/services/class.service";
import type { NextFunction, Request, Response } from "express";

// Get All
export const getClass = async (req: Request, res: Response) => {
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
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            section: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            roomNumber: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const [classData, totalCount] = await prisma.$transaction([
      prisma.class.findMany({
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
      prisma.class.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      message: "Class fetched successfully",
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      data: classData,
    });
  } catch (error: any) {
    console.error("Get Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get By ID
export const getClassById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const classData = await prisma.class.findUnique({
      where: { id: id as string },
      include: {
        school: true,
      },
    });

    if (!classData) {
      return next(new AppError("Class not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "Class fetched successfully", data: classData });
  } catch (error: any) {
    console.error("Get By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create Parent
export const createClass = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { schoolId, gradeLevelId, name, section, roomNumber } = req.body;

    if (!schoolId) {
      return next(new AppError("Missing required fields.", 400));
    }
    const newClass = await createClassService({
      schoolId,
      gradeLevelId,
      name,
      section,
      roomNumber,
    });

    return res.status(201).json({
      success: true,
      message: "Class created successfully.",
      data: newClass,
    });
  } catch (error: any) {
    console.error("Create Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update Parent
export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { schoolId, gradeLevelId, name, section, roomNumber } = req.body;
    const updatedClass = await updateClassService({
      id: id as string,
      schoolId,
      gradeLevelId,
      name,
      section,
      roomNumber,
    });

    return res.status(200).json({
      success: true,
      message: "Class updated successfully",
      data: updatedClass,
    });
  } catch (error: any) {
    console.error("Update Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete Parent
export const deleteClass = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const classData = await prisma.class.findUnique({
      where: { id: id as string },
    });

    if (!classData) {
      return next(new AppError("Class not found.", 404));
    }

    await prisma.class.delete({
      where: { id: classData.id },
    });

    return res
      .status(204)
      .json({ success: true, message: "Class deactivated successfully." });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

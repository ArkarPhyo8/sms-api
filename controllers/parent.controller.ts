import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import {
  createParentService,
  updateParentService,
} from "@/services/parent.service";
import type { NextFunction, Request, Response } from "express";

// Get All
export const getParent = async (req: Request, res: Response) => {
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
            user: {
              firstName: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          },
        ],
      });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const [parent, totalCount] = await prisma.$transaction([
      prisma.parent.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          school: true,
          user: true,
        },
      }),
      prisma.parent.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      message: "parent fetched successfully",
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      data: parent,
    });
  } catch (error: any) {
    console.error("Get Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get By ID
export const getParentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const parent = await prisma.parent.findUnique({
      where: { id: id as string },
      include: {
        school: true,
      },
    });

    if (!parent) {
      return next(new AppError("Parent not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "Parent fetched successfully", data: parent });
  } catch (error: any) {
    console.error("Get Parent By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create Parent
export const createParent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { schoolId, userId, occupation } = req.body;

    if (!schoolId) {
      return next(new AppError("Missing required fields.", 400));
    }
    const newParent = await createParentService({
      schoolId,
      userId,
      occupation,
    });

    return res.status(201).json({
      success: true,
      message: "Parent created successfully.",
      data: newParent,
    });
  } catch (error: any) {
    console.error("Create Parent Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update Parent
export const updateParent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { schoolId, userId, occupation } = req.body;
    const updatedParent = await updateParentService({
      id: id as string,
      schoolId,
      userId,
      occupation,
    });

    return res.status(200).json({
      success: true,
      message: "Parent updated successfully",
      data: updatedParent,
    });
  } catch (error: any) {
    console.error("Update Parent Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete Parent
export const deleteParent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const parent = await prisma.parent.findUnique({
      where: { id: id as string },
    });

    if (!parent) {
      return next(new AppError("Parent not found.", 404));
    }

    await prisma.parent.delete({
      where: { id: parent.id },
    });

    return res
      .status(204)
      .json({ success: true, message: "Parent deactivated successfully." });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

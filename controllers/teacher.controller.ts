import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import {
  createTeacherService,
  updateTeacherService,
} from "@/services/teacher.service";
import type { NextFunction, Request, Response } from "express";

// Get All Teacher
export const getTeacher = async (req: Request, res: Response) => {
  try {
    const schoolId = req.query.schoolId as string | undefined;
    const role = req.query.role as string | undefined;
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
    if (role) {
      andConditions.push({ role });
    }

    if (search) {
      andConditions.push({
        OR: [
          {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            firstName: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const [teacher, totalCount] = await prisma.$transaction([
      prisma.teacher.findMany({
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
      prisma.teacher.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      message: "Teacher fetched successfully",
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      data: teacher,
    });
  } catch (error: any) {
    console.error("Get Teacher Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get Teacher By ID
export const getTeacherById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { id: id as string },
      include: {
        school: true,
      },
    });

    if (!teacher) {
      return next(new AppError("Teacher not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "Teacher fetched successfully", data: teacher });
  } catch (error: any) {
    console.error("Get Teacher By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create Teacher
export const createTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { schoolId, userId, qualification } = req.body;

    if (!schoolId) {
      return next(new AppError("Missing required fields.", 400));
    }
    const newTeacher = await createTeacherService({
      schoolId,
      userId,
      qualification,
    });

    return res.status(201).json({
      success: true,
      message: "Teacher created successfully.",
      data: newTeacher,
    });
  } catch (error: any) {
    console.error("Create Teacher Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update Teacher
export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, qualification } = req.body;
    req.body.removeLogo === "true" || req.body.removeLogo === true;

    const updatedTeacher = await updateTeacherService({
      id: id as string,
      userId,
      qualification,
    });

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  } catch (error: any) {
    console.error("Update Teacher Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete Teacher
export const deleteTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { id: id as string },
    });
    if (!teacher) {
      return next(new AppError("Teacher not found.", 404));
    }

    await prisma.teacher.delete({
      where: { id: teacher.id },
    });

    return res
      .status(204)
      .json({ success: true, message: "Teacher deactivated successfully." });
  } catch (error: any) {
    console.error("Delete Teacher Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

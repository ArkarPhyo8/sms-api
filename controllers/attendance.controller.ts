import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import {
  createAttendanceService,
  updateAttendanceService,
} from "@/services/attendance.service";
import type { NextFunction, Request, Response } from "express";

// Get All
export const getAttendance = async (req: Request, res: Response) => {
  try {
    const studentId = req.query.studentId as string | undefined;
    const teacherId = req.query.teacherId as string | undefined;
    const search = (req.query.search as string) || "";

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder =
      (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    const andConditions: any[] = [];

    if (studentId) {
      andConditions.push({ studentId });
    }
    if (teacherId) {
      andConditions.push({ teacherId });
    }

    if (search) {
      andConditions.push({
        OR: [
          {
            status: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const [attendance, totalCount] = await prisma.$transaction([
      prisma.attendance.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          student: true,
          teacher: true,
        },
      }),
      prisma.term.count({
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
      data: attendance,
    });
  } catch (error: any) {
    console.error("Get Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get By ID
export const getAttendanceById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.findUnique({
      where: { id: id as string },
      include: {
        student: true,
        teacher: true,
      },
    });

    if (!attendance) {
      return next(new AppError("Attendance not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "Fetched successfully", data: attendance });
  } catch (error: any) {
    console.error("Get By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create
export const createAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId, teacherId, date, status, remarks } = req.body;

    if (!studentId || !teacherId) {
      return next(new AppError("Missing required fields.", 400));
    }
    const newAttendance = await createAttendanceService({
      studentId,
      teacherId,
      date,
      status,
      remarks,
    });

    return res.status(201).json({
      success: true,
      message: "Created successfully.",
      data: newAttendance,
    });
  } catch (error: any) {
    console.error("Create Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { studentId, teacherId, date, status, remarks } = req.body;
    const update = await updateAttendanceService({
      id: id as string,
      studentId,
      teacherId,
      date,
      status,
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
export const deleteAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.findUnique({
      where: { id: id as string },
    });

    if (!attendance) {
      return next(new AppError("Term not found.", 404));
    }

    await prisma.attendance.delete({
      where: { id: attendance.id },
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

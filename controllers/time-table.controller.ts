import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import {
  createTimeTableService,
  updateTimeTableService,
} from "@/services/timeTable.service";
import type { NextFunction, Request, Response } from "express";

// Get All
export const getTimeTable = async (req: Request, res: Response) => {
  try {
    const classId = req.query.classId as string | undefined;
    const subjectId = req.query.subjectId as string | undefined;
    const teacherId = req.query.teacherId as string | undefined;
    const search = (req.query.search as string) || "";

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const andConditions: any[] = [];

    if (classId) {
      andConditions.push({ classId });
    }
    if (subjectId) {
      andConditions.push({ subjectId });
    }
    if (teacherId) {
      andConditions.push({ teacherId });
    }

    if (search) {
      andConditions.push({
        OR: [
          {
            room: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const [timeTable, totalCount] = await prisma.$transaction([
      prisma.timetable.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        include: {
          class: true,
          subject: true,
          teacher: true,
        },
      }),
      prisma.timetable.count({
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
      data: timeTable,
    });
  } catch (error: any) {
    console.error("Get Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get By ID
export const getTimeTableById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const timeTable = await prisma.timetable.findUnique({
      where: { id: id as string },
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
    });

    if (!timeTable) {
      return next(new AppError("Time Table not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "Fetched successfully", data: timeTable });
  } catch (error: any) {
    console.error("Get By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create
export const createTimeTable = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      classId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room,
    } = req.body;

    if (!classId || !subjectId || !teacherId) {
      return next(new AppError("Missing required fields.", 400));
    }
    const newTerm = await createTimeTableService({
      classId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room,
    });

    return res.status(201).json({
      success: true,
      message: "Created successfully.",
      data: newTerm,
    });
  } catch (error: any) {
    console.error("Create Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update
export const updateTimeTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      classId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room,
    } = req.body;
    const update = await updateTimeTableService({
      id: id as string,
      classId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room,
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
export const deleteTimeTable = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const timeTable = await prisma.timetable.findUnique({
      where: { id: id as string },
    });

    if (!timeTable) {
      return next(new AppError("Term not found.", 404));
    }

    await prisma.timetable.delete({
      where: { id: timeTable.id },
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

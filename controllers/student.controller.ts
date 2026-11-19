import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import {
  createStudentService,
  updateStudentService,
} from "@/services/student.service";
import type { NextFunction, Request, Response } from "express";

// Get All
export const getStudent = async (req: Request, res: Response) => {
  try {
    const schoolId = req.query.schoolId as string | undefined;
    const admissionNumber = req.query.admissionNumber as string | undefined;
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
    if (admissionNumber) {
      andConditions.push({ admissionNumber });
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

    const [student, totalCount] = await prisma.$transaction([
      prisma.student.findMany({
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
      prisma.student.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      message: "student fetched successfully",
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      data: student,
    });
  } catch (error: any) {
    console.error("Get Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get Student By ID
export const getStudentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: id as string },
      include: {
        school: true,
      },
    });

    if (!student) {
      return next(new AppError("Student not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "Student fetched successfully", data: student });
  } catch (error: any) {
    console.error("Get Student By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create Student
export const createStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      schoolId,
      userId,
      rollNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
    } = req.body;

    if (!schoolId) {
      return next(new AppError("Missing required fields.", 400));
    }
    const newStudent = await createStudentService({
      schoolId,
      userId,
      rollNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully.",
      data: newStudent,
    });
  } catch (error: any) {
    console.error("Create Student Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update Student
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      schoolId,
      userId,
      rollNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
    } = req.body;
    const updatedStudent = await updateStudentService({
      id: id as string,
      schoolId,
      userId,
      rollNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
    });

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error: any) {
    console.error("Update Student Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete Student
export const deleteStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: id as string },
    });
    if (!student) {
      return next(new AppError("Student not found.", 404));
    }

    await prisma.student.delete({
      where: { id: student.id },
    });

    return res
      .status(204)
      .json({ success: true, message: "Student deactivated successfully." });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import {
  createSubjectService,
  updateSubjectService,
} from "@/services/subject.service";
import type { NextFunction, Request, Response } from "express";

// Get All
export const getSubject = async (req: Request, res: Response) => {
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
            code: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const [subject, totalCount] = await prisma.$transaction([
      prisma.subject.findMany({
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
      prisma.subject.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      message: "fetched successfully",
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      data: subject,
    });
  } catch (error: any) {
    console.error("Get Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get By ID
export const getSubjectById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id: id as string },
      include: {
        school: true,
      },
    });

    if (!subject) {
      return next(new AppError("Subject not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "fetched successfully", data: subject });
  } catch (error: any) {
    console.error("Get Parent By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create Parent
export const createSubject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { schoolId, name, code, description } = req.body;

    if (!schoolId) {
      return next(new AppError("Missing required fields.", 400));
    }
    const newSubject = await createSubjectService({
      schoolId,
      name,
      code,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "created successfully.",
      data: newSubject,
    });
  } catch (error: any) {
    console.error("Create Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update
export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { schoolId, name, code, description } = req.body;
    const updatedSubject = await updateSubjectService({
      id: id as string,
      schoolId,
      name,
      code,
      description,
    });

    return res.status(200).json({
      success: true,
      message: "updated successfully",
      data: updatedSubject,
    });
  } catch (error: any) {
    console.error("Update Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete
export const deleteSubject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id: id as string },
    });

    if (!subject) {
      return next(new AppError("Subject not found.", 404));
    }

    await prisma.subject.delete({
      where: { id: subject.id },
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

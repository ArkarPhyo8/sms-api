import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import {
  createAcademicYearService,
  updateAcademicYearService,
} from "@/services/academic-year.service";
import type { NextFunction, Request, Response } from "express";

// Get All
export const getAcademicYear = async (req: Request, res: Response) => {
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
        ],
      });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const [academic_year, totalCount] = await prisma.$transaction([
      prisma.academicYear.findMany({
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
      prisma.academicYear.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      message: "Academic Year fetched successfully",
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      data: academic_year,
    });
  } catch (error: any) {
    console.error("Get Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get By ID
export const getAcademicYearById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const academic_year = await prisma.academicYear.findUnique({
      where: { id: id as string },
      include: {
        school: true,
      },
    });

    if (!academic_year) {
      return next(new AppError("Academic Year not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "Fetched successfully", data: academic_year });
  } catch (error: any) {
    console.error("Get By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create
export const createAcademicYear = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { schoolId, name, startDate, endDate, isCurrent } = req.body;

    if (!schoolId) {
      return next(new AppError("Missing required fields.", 400));
    }
    const newAcademicYear = await createAcademicYearService({
      schoolId,
      name,
      startDate,
      endDate,
      isCurrent,
    });

    return res.status(201).json({
      success: true,
      message: "Created successfully.",
      data: newAcademicYear,
    });
  } catch (error: any) {
    console.error("Create Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update
export const updateAcademicYear = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { schoolId, name, startDate, endDate, isCurrent } = req.body;
    const update = await updateAcademicYearService({
      id: id as string,
      schoolId,
      name,
      startDate,
      endDate,
      isCurrent,
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
export const deleteAcademicYear = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const academicYear = await prisma.academicYear.findUnique({
      where: { id: id as string },
    });

    if (!academicYear) {
      return next(new AppError("Academic Year not found.", 404));
    }

    await prisma.academicYear.delete({
      where: { id: academicYear.id },
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

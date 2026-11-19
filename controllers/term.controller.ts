import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import { createTermService, updateTermService } from "@/services/term.service";
import type { NextFunction, Request, Response } from "express";

// Get All
export const getTerm = async (req: Request, res: Response) => {
  try {
    const academicYearId = req.query.academicYearId as string | undefined;
    const search = (req.query.search as string) || "";

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder =
      (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    const andConditions: any[] = [];

    if (academicYearId) {
      andConditions.push({ academicYearId });
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

    const [term, totalCount] = await prisma.$transaction([
      prisma.term.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          academicYear: true,
        },
      }),
      prisma.term.count({
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
      data: term,
    });
  } catch (error: any) {
    console.error("Get Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get By ID
export const getTermById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const term = await prisma.term.findUnique({
      where: { id: id as string },
      include: {
        academicYear: true,
      },
    });

    if (!term) {
      return next(new AppError("Term not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "Fetched successfully", data: term });
  } catch (error: any) {
    console.error("Get By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create
export const createTerm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { academicYearId, name, startDate, endDate, isCurrent } = req.body;

    if (!academicYearId) {
      return next(new AppError("Missing required fields.", 400));
    }
    const newTerm = await createTermService({
      academicYearId,
      name,
      startDate,
      endDate,
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
export const updateTerm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { academicYearId, name, startDate, endDate } = req.body;
    const update = await updateTermService({
      id: id as string,
      academicYearId,
      name,
      startDate,
      endDate,
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
export const deleteTerm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const term = await prisma.term.findUnique({
      where: { id: id as string },
    });

    if (!term) {
      return next(new AppError("Term not found.", 404));
    }

    await prisma.term.delete({
      where: { id: term.id },
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

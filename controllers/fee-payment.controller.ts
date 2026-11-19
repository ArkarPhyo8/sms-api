import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import { createExamService, updateExamService } from "@/services/exam.service";
import {
  createFeePaymentService,
  updateFeePaymentService,
} from "@/services/fee-payment.service";
import type { NextFunction, Request, Response } from "express";

// Get All
export const getFeePayment = async (req: Request, res: Response) => {
  try {
    const feeStructureId = req.query.feeStructureId as string | undefined;
    const studentId = req.query.studentId as string | undefined;
    const termId = req.query.termId as string | undefined;
    const search = (req.query.search as string) || "";

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder =
      (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    const andConditions: any[] = [];

    if (feeStructureId) {
      andConditions.push({ feeStructureId });
    }

    if (studentId) {
      andConditions.push({ studentId });
    }

    if (termId) {
      andConditions.push({ termId });
    }

    if (search) {
      andConditions.push({
        OR: [
          {
            paymentMethod: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const [feePayment, totalCount] = await prisma.$transaction([
      prisma.feePayment.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          feeStructure: true,
          student: true,
        },
      }),
      prisma.feePayment.count({
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
      data: feePayment,
    });
  } catch (error: any) {
    console.error("Get Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get By ID
export const getFeePaymentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const feePayment = await prisma.feePayment.findUnique({
      where: { id: id as string },
    });

    if (!feePayment) {
      return next(new AppError("Fee Payment not found.", 404));
    }

    return res
      .status(200)
      .json({ message: "Fetched successfully", data: feePayment });
  } catch (error: any) {
    console.error("Get By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create
export const createFeePayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      feeStructureId,
      studentId,
      transactionId,
      status,
      paymentMethod,
      amountPaid,
      receiptNumber,
    } = req.body;

    if (!feeStructureId || !studentId) {
      return next(new AppError("Missing required fields.", 400));
    }
    const newExam = await createFeePaymentService({
      feeStructureId,
      studentId,
      transactionId,
      status,
      paymentMethod,
      amountPaid,
      receiptNumber,
    });

    return res.status(201).json({
      success: true,
      message: "Created successfully.",
      data: newExam,
    });
  } catch (error: any) {
    console.error("Create Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update
export const updateFeePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      feeStructureId,
      studentId,
      transactionId,
      status,
      paymentMethod,
      amountPaid,
      receiptNumber,
    } = req.body;
    const update = await updateFeePaymentService({
      id: id as string,
      feeStructureId,
      studentId,
      transactionId,
      status,
      paymentMethod,
      amountPaid,
      receiptNumber,
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
export const deleteFeePayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const feePayment = await prisma.feePayment.findUnique({
      where: { id: id as string },
    });

    if (!feePayment) {
      return next(new AppError("Fee Payment not found.", 404));
    }

    await prisma.feePayment.delete({
      where: { id: feePayment.id },
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

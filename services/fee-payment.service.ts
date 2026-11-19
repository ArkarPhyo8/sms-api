import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";
import type { FeeStatusType } from "@/types";

interface CreateProps {
  feeStructureId: string;
  studentId: string;
  transactionId?: string;
  status: FeeStatusType;
  paymentMethod?: string;
  amountPaid: number;
  receiptNumber: string;
}

export const createFeePaymentService = async (data: CreateProps) => {
  const {
    feeStructureId,
    studentId,
    transactionId,
    status,
    paymentMethod,
    amountPaid,
    receiptNumber,
  } = data;

  const newFeePayment = await prisma.feePayment.create({
    data: {
      feeStructureId,
      studentId,
      transactionId,
      status,
      paymentMethod,
      amountPaid,
      receiptNumber,
    },
  });

  return newFeePayment;
};

interface UpdateProps {
  id: string;
  feeStructureId: string;
  studentId: string;
  transactionId?: string;
  status: FeeStatusType;
  paymentMethod?: string;
  amountPaid: number;
  receiptNumber: string;
}
export const updateFeePaymentService = async (data: UpdateProps) => {
  const {
    id,
    feeStructureId,
    studentId,
    transactionId,
    status,
    paymentMethod,
    amountPaid,
    receiptNumber,
  } = data;

  const existingFeePayment = await prisma.feePayment.findUnique({
    where: { id },
  });

  if (!existingFeePayment) {
    throw new AppError("Fee Payment not found", 404);
  }

  const updatedFeePayment = await prisma.feePayment.update({
    where: { id },
    data: {
      feeStructureId,
      studentId,
      transactionId,
      status,
      paymentMethod,
      amountPaid,
      receiptNumber,
    },
  });

  return updatedFeePayment;
};

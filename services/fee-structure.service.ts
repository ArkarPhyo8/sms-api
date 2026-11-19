import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";

interface CreateProps {
  schoolId: string;
  gradeLevelId: string;
  name: string;
  amount: number;
  dueDate: Date;
}

export const createFeeStructureService = async (data: CreateProps) => {
  const { schoolId, gradeLevelId, name, amount, dueDate } = data;

  const newFeeStructure = await prisma.feeStructure.create({
    data: {
      schoolId,
      gradeLevelId,
      name,
      amount,
      dueDate,
    },
  });

  return newFeeStructure;
};

interface UpdateProps {
  id: string;
  schoolId: string;
  gradeLevelId: string;
  name: string;
  amount: number;
  dueDate: Date;
}
export const updateFeeStructureService = async (data: UpdateProps) => {
  const { id, schoolId, gradeLevelId, name, amount, dueDate } = data;

  const existingFeeStructure = await prisma.feeStructure.findUnique({
    where: { id },
  });

  if (!existingFeeStructure) {
    throw new AppError("Fee Structure not found", 404);
  }

  const updated = await prisma.feeStructure.update({
    where: { id },
    data: {
      schoolId,
      gradeLevelId,
      name,
      amount,
      dueDate,
    },
  });

  return updated;
};

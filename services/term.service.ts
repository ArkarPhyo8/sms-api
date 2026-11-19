import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";

interface CreateProps {
  academicYearId: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

export const createTermService = async (data: CreateProps) => {
  const { academicYearId, name, startDate, endDate } = data;

  const newTerm = await prisma.term.create({
    data: {
      academicYearId,
      name,
      startDate,
      endDate,
    },
  });

  return newTerm;
};

interface UpdateProps {
  id: string;
  academicYearId: string;
  name: string;
  startDate: Date;
  endDate: Date;
}
export const updateTermService = async (data: UpdateProps) => {
  const { id, name, startDate, endDate } = data;

  const existingTerm = await prisma.term.findUnique({
    where: { id },
  });

  if (!existingTerm) {
    throw new AppError("Term not found", 404);
  }

  const updatedTerm = await prisma.term.update({
    where: { id },
    data: {
      name,
      startDate,
      endDate,
    },
  });

  return updatedTerm;
};

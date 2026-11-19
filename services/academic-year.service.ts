import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";

interface CreateProps {
  schoolId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent?: boolean;
}

export const createAcademicYearService = async (data: CreateProps) => {
  const { schoolId, name, startDate, endDate, isCurrent } = data;

  const newAcademicYear = await prisma.academicYear.create({
    data: {
      schoolId,
      name,
      startDate,
      endDate,
      isCurrent,
    },
  });

  return newAcademicYear;
};

interface UpdateProps {
  id: string;
  schoolId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent?: boolean;
}
export const updateAcademicYearService = async (data: UpdateProps) => {
  const { id, name, startDate, endDate, isCurrent } = data;

  const existingAcademicYear = await prisma.academicYear.findUnique({
    where: { id },
  });

  if (!existingAcademicYear) {
    throw new AppError("Academic Year not found", 404);
  }

  const updatedAcademicYear = await prisma.academicYear.update({
    where: { id },
    data: {
      name,
      startDate,
      endDate,
      isCurrent,
    },
  });

  return updatedAcademicYear;
};

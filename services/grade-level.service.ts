import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";

interface CreateProps {
  name: string;
  levelNumber: number;
}

export const createGradeLevelService = async (data: CreateProps) => {
  const { name, levelNumber } = data;

  const newGradeLevel = await prisma.gradeLevel.create({
    data: {
      name,
      levelNumber,
    },
  });

  return newGradeLevel;
};

interface UpdateProps {
  id: string;
  name: string;
  levelNumber: number;
}
export const updateGradeLevelService = async (data: UpdateProps) => {
  const { id, name, levelNumber } = data;

  const existingGradeLevel = await prisma.gradeLevel.findUnique({
    where: { id },
  });

  if (!existingGradeLevel) {
    throw new AppError("Grade Level not found", 404);
  }

  const updatedGradeLevel = await prisma.gradeLevel.update({
    where: { id },
    data: {
      name,
      levelNumber,
    },
  });

  return updatedGradeLevel;
};

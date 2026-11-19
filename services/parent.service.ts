import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";

interface CreateProps {
  schoolId: string;
  userId: string;
  occupation?: string;
}

export const createParentService = async (data: CreateProps) => {
  const { schoolId, userId, occupation } = data;

  const newParent = await prisma.parent.create({
    data: {
      schoolId,
      userId,
      occupation,
    },
  });

  return newParent;
};

interface UpdateProps {
  id: string;
  schoolId: string;
  userId: string;
  occupation?: string;
}
export const updateParentService = async (data: UpdateProps) => {
  const { id, schoolId, userId, occupation } = data;

  const existingParent = await prisma.parent.findUnique({
    where: { userId, schoolId },
  });

  if (!existingParent) {
    throw new AppError("Parent not found", 404);
  }

  const updatedParent = await prisma.parent.update({
    where: { id },
    data: {
      occupation,
    },
  });

  return updatedParent;
};

import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";

interface CreateProps {
  schoolId: string;
  gradeLevelId: string;
  name: string;
  section?: string;
  roomNumber?: string;
}

export const createClassService = async (data: CreateProps) => {
  const { schoolId, gradeLevelId, name, section, roomNumber } = data;

  const newClass = await prisma.class.create({
    data: {
      schoolId,
      gradeLevelId,
      name,
      section,
      roomNumber,
    },
  });

  return newClass;
};

interface UpdateProps {
  id: string;
  schoolId: string;
  gradeLevelId: string;
  name: string;
  section?: string;
  roomNumber?: string;
}
export const updateClassService = async (data: UpdateProps) => {
  const { id, name, section, roomNumber } = data;

  const existingClass = await prisma.class.findUnique({
    where: { id },
  });

  if (!existingClass) {
    throw new AppError("Class not found", 404);
  }

  const updatedClass = await prisma.class.update({
    where: { id },
    data: {
      name,
      section,
      roomNumber,
    },
  });

  return updatedClass;
};

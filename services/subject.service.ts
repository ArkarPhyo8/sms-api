import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";

interface CreateProps {
  schoolId: string;
  name: string;
  code: string;
  description?: string;
}

export const createSubjectService = async (data: CreateProps) => {
  const { schoolId, name, code, description } = data;

  const newSubject = await prisma.subject.create({
    data: {
      schoolId,
      name,
      code,
      description,
    },
  });

  return newSubject;
};

interface UpdateProps {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  description?: string;
}
export const updateSubjectService = async (data: UpdateProps) => {
  const { id, schoolId, name, code, description } = data;

  const existingSubject = await prisma.subject.findUnique({
    where: { id },
  });

  if (!existingSubject) {
    throw new AppError("Subject not found", 404);
  }

  const updatedSubject = await prisma.subject.update({
    where: { id },
    data: {
      schoolId,
      name,
      code,
      description,
    },
  });

  return updatedSubject;
};

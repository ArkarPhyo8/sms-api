import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";
import { generateCustomId } from "@/utils/generateId";

interface CreateProps {
  schoolId: string;
  userId: string;
  qualification?: string;
}

export const createTeacherService = async (data: CreateProps) => {
  const { schoolId, userId, qualification } = data;

  const employeeId = await generateCustomId({
    prisma,
    modelName: "teacher",
    schoolId: schoolId,
    prefix: "TCH",
  });

  const existingTeacher = await prisma.teacher.findUnique({
    where: {
      schoolId_employeeId: {
        schoolId: schoolId,
        employeeId: employeeId,
      },
    },
  });
  if (existingTeacher) {
    throw new AppError("Teacher already exists with this employeeId.", 400);
  }

  const newTeacher = await prisma.teacher.create({
    data: {
      schoolId,
      userId,
      employeeId,
      qualification,
      joiningDate: new Date(),
    },
  });

  return newTeacher;
};

interface UpdateProps {
  id: string;
  userId: string;
  qualification?: string;
}
export const updateTeacherService = async (data: UpdateProps) => {
  const { id, userId, qualification } = data;

  const existingTeacher = await prisma.teacher.findUnique({
    where: { userId },
  });

  if (!existingTeacher) {
    throw new AppError("Teacher not found", 404);
  }

  const updatedTeacher = await prisma.teacher.update({
    where: { id },
    data: {
      qualification,
    },
  });

  return updatedTeacher;
};

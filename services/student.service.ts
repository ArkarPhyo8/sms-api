import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";
import { generateCustomId } from "@/utils/generateId";
import type { GenderType } from "@/types/gender.type";

interface CreateProps {
  schoolId: string;
  userId: string;
  rollNumber?: string;
  dateOfBirth: Date;
  gender: GenderType;
  bloodGroup?: string;
  address?: string;
}

export const createStudentService = async (data: CreateProps) => {
  const {
    schoolId,
    userId,
    rollNumber,
    dateOfBirth,
    gender,
    bloodGroup,
    address,
  } = data;

  const admissionNumber = await generateCustomId({
    prisma,
    modelName: "student",
    schoolId: schoolId,
    prefix: "ADM",
  });

  const existingStudent = await prisma.student.findUnique({
    where: { admissionNumber },
  });
  if (existingStudent) {
    throw new AppError(
      "Student already exists with this admission number.",
      400,
    );
  }

  const newStudent = await prisma.student.create({
    data: {
      schoolId,
      userId,
      admissionNumber,
      rollNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
    },
  });

  return newStudent;
};

interface UpdateProps {
  id: string;
  schoolId: string;
  userId: string;
  rollNumber?: string;
  dateOfBirth: Date;
  gender: GenderType;
  bloodGroup?: string;
  address?: string;
}
export const updateStudentService = async (data: UpdateProps) => {
  const {
    id,
    schoolId,
    userId,
    rollNumber,
    dateOfBirth,
    gender,
    bloodGroup,
    address,
  } = data;

  const existingStudent = await prisma.student.findUnique({
    where: { userId, schoolId },
  });

  if (!existingStudent) {
    throw new AppError("Student not found", 404);
  }

  const updatedStudent = await prisma.student.update({
    where: { id },
    data: {
      rollNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
    },
  });

  return updatedStudent;
};

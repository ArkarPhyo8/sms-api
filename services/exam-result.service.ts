import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";

interface CreateProps {
  examId: string;
  studentId: string;
  marksObtained: number;
  grade?: string;
  remarks?: string;
}

export const createExamResultService = async (data: CreateProps) => {
  const { examId, studentId, marksObtained, grade, remarks } = data;

  const newExamResult = await prisma.examResult.create({
    data: {
      examId,
      studentId,
      marksObtained,
      grade,
      remarks,
    },
  });

  return newExamResult;
};

interface UpdateProps {
  id: string;
  examId: string;
  studentId: string;
  marksObtained: number;
  grade?: string;
  remarks?: string;
}
export const updateExamResultService = async (data: UpdateProps) => {
  const { id, examId, studentId, marksObtained, grade, remarks } = data;

  const existingExamResult = await prisma.examResult.findUnique({
    where: { id },
  });

  if (!existingExamResult) {
    throw new AppError("Exam Result not found", 404);
  }

  const updatedExamResult = await prisma.examResult.update({
    where: { id },
    data: {
      examId,
      studentId,
      marksObtained,
      grade,
      remarks,
    },
  });

  return updatedExamResult;
};

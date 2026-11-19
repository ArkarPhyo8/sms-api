import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";

interface CreateProps {
  academicYearId: string;
  subjectId: string;
  termId?: string;
  name: string;
  maxMarks: number;
  examDate: Date;
}

export const createExamService = async (data: CreateProps) => {
  const { academicYearId, subjectId, termId, name, maxMarks, examDate } = data;

  const newExam = await prisma.exam.create({
    data: {
      academicYearId,
      subjectId,
      termId: termId && termId !== "" ? termId : undefined,
      name,
      maxMarks,
      examDate,
    },
  });

  return newExam;
};

interface UpdateProps {
  id: string;
  academicYearId: string;
  subjectId: string;
  termId?: string;
  name: string;
  maxMarks: number;
  examDate: Date;
}
export const updateExamService = async (data: UpdateProps) => {
  const { id, academicYearId, subjectId, termId, name, maxMarks, examDate } =
    data;

  const existingExam = await prisma.exam.findUnique({
    where: { id },
  });

  if (!existingExam) {
    throw new AppError("Exam not found", 404);
  }

  const updatedExam = await prisma.exam.update({
    where: { id },
    data: {
      academicYearId,
      subjectId,
      termId,
      name,
      maxMarks,
      examDate,
    },
  });

  return updatedExam;
};

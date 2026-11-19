import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";

interface CreateProps {
  bookId: string;
  studentId: string;
  dueDate: Date;
  returnDate?: Date;
  isReturned: boolean;
}

export const createBookIssueService = async (data: CreateProps) => {
  const { bookId, studentId, dueDate, returnDate, isReturned } = data;

  const newBookIssue = await prisma.bookIssue.create({
    data: {
      bookId,
      studentId,
      dueDate,
      returnDate,
      isReturned,
    },
  });

  return newBookIssue;
};

interface UpdateProps {
  id: string;
  bookId: string;
  studentId: string;
  dueDate: Date;
  returnDate?: Date;
  isReturned: boolean;
}
export const updateBookIssueService = async (data: UpdateProps) => {
  const { id, bookId, studentId, dueDate, returnDate, isReturned } = data;

  const existingBookIssue = await prisma.bookIssue.findUnique({
    where: { id },
  });

  if (!existingBookIssue) {
    throw new AppError("Book Issue not found", 404);
  }

  const updatedBook = await prisma.bookIssue.update({
    where: { id },
    data: {
      bookId,
      studentId,
      dueDate,
      returnDate,
      isReturned,
    },
  });

  return updatedBook;
};

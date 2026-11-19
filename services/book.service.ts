import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";

interface CreateProps {
  schoolId: string;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  totalCopies: number;
  availableCopies: number;
}

export const createBookService = async (data: CreateProps) => {
  const {
    schoolId,
    title,
    author,
    isbn,
    category,
    totalCopies,
    availableCopies,
  } = data;

  const newBook = await prisma.book.create({
    data: {
      schoolId,
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies,
    },
  });

  return newBook;
};

interface UpdateProps {
  id: string;
  schoolId: string;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  totalCopies: number;
  availableCopies: number;
}
export const updateBookService = async (data: UpdateProps) => {
  const {
    id,
    schoolId,
    title,
    author,
    isbn,
    category,
    totalCopies,
    availableCopies,
  } = data;

  const existingBook = await prisma.book.findUnique({
    where: { id },
  });

  if (!existingBook) {
    throw new AppError("Book not found", 404);
  }

  const updatedBook = await prisma.book.update({
    where: { id },
    data: {
      schoolId,
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies,
    },
  });

  return updatedBook;
};

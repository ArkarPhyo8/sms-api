import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";

interface CreateProps {
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}

export const createTimeTableService = async (data: CreateProps) => {
  const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room } =
    data;

  const newTimeTable = await prisma.timetable.create({
    data: {
      classId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room,
    },
  });

  return newTimeTable;
};

interface UpdateProps {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}
export const updateTimeTableService = async (data: UpdateProps) => {
  const {
    id,
    classId,
    subjectId,
    teacherId,
    dayOfWeek,
    startTime,
    endTime,
    room,
  } = data;

  const existingTimeTable = await prisma.timetable.findUnique({
    where: { id },
  });

  if (!existingTimeTable) {
    throw new AppError("Time Table not found", 404);
  }

  const updatedTimeTable = await prisma.timetable.update({
    where: { id },
    data: {
      classId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room,
    },
  });

  return updatedTimeTable;
};

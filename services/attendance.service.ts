import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";
import type { AttendanceStatusType } from "@/types";

interface CreateProps {
  studentId: string;
  teacherId: string;
  date: Date;
  status: AttendanceStatusType;
  remarks: string;
}

export const createAttendanceService = async (data: CreateProps) => {
  const { studentId, teacherId, date, status, remarks } = data;

  const newAttendance = await prisma.attendance.create({
    data: {
      studentId,
      teacherId,
      date,
      status,
      remarks,
    },
  });

  return newAttendance;
};

interface UpdateProps {
  id: string;
  studentId: string;
  teacherId: string;
  date: Date;
  status: AttendanceStatusType;
  remarks: string;
}
export const updateAttendanceService = async (data: UpdateProps) => {
  const { id, studentId, teacherId, date, status, remarks } = data;

  const existingAttendance = await prisma.attendance.findUnique({
    where: { id },
  });

  if (!existingAttendance) {
    throw new AppError("Attendance not found", 404);
  }

  const updatedAttendance = await prisma.attendance.update({
    where: { id },
    data: {
      studentId,
      teacherId,
      date,
      status,
      remarks,
    },
  });

  return updatedAttendance;
};

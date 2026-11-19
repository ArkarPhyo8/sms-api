import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";
import { deleteFromCloudinary, uploadToCloudinary } from "./cloudinary.service";
import bcrypt from "bcryptjs";
import type { RoleType } from "@/types";

const password = process.env.USER_PW || "abc123";

interface Props {
  schoolId: string;
  email: string;
  role: RoleType;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
  file?: Express.Multer.File;
}

export const createUserService = async (data: Props) => {
  const { schoolId, email, phone, role, firstName, lastName, isActive, file } =
    data;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("User already exists with this email.", 400);
  }

  let avatarUrl = null;

  if (file) {
    try {
      avatarUrl = await uploadToCloudinary(file.buffer, "user/image");
    } catch (error) {
      throw new AppError("Failed to upload logo image to cloud storage", 500);
    }
  }

  const newUser = await prisma.user.create({
    data: {
      schoolId,
      email,
      passwordHash: hashedPassword,
      role,
      firstName,
      lastName,
      phone,
      avatarUrl,
      isActive,
    },
    omit: {
      passwordHash: true,
    },
  });

  return newUser;
};

interface UpdateProps {
  id: string;
  schoolId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
  file?: Express.Multer.File;
  removeLogo?: boolean;
}
export const updateUserService = async (data: UpdateProps) => {
  const {
    id,
    schoolId,
    email,
    phone,
    firstName,
    lastName,
    isActive,
    file,
    removeLogo,
  } = data;

  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  let avatarUrl = existingUser.avatarUrl;

  if (file) {
    if (existingUser.avatarUrl) {
      await deleteFromCloudinary(existingUser.avatarUrl);
    }
    avatarUrl = await uploadToCloudinary(file.buffer, "user/image");
  } else if (removeLogo) {
    if (existingUser.avatarUrl) {
      await deleteFromCloudinary(existingUser.avatarUrl);
    }
    avatarUrl = null;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      schoolId,
      email,
      firstName,
      lastName,
      phone,
      avatarUrl,
      isActive,
    },
    omit: {
      passwordHash: true,
    },
  });

  return updatedUser;
};

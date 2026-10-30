import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";

// Create User (Register)
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      schoolId,
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      avatarUrl,
      isActive,
    } = req.body;

    if (!schoolId || !email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        schoolId,
        email,
        passwordHash: hashedPassword,
        role,
        firstName,
        lastName,
        phone: phone || null,
        avatarUrl: avatarUrl || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    const { passwordHash, ...userResponse } = newUser;
    return res.status(201).json({
      message: "User created successfully.",
      data: userResponse,
    });
  } catch (error: any) {
    console.error("Create User Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get All Users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { schoolId, role } = req.query;

    const users = await prisma.user.findMany({
      where: {
        ...(schoolId ? { schoolId: String(schoolId) } : {}),
        ...(role ? { role: role as any } : {}),
      },
      include: {
        school: true,
        studentProfile: true,
        teacherProfile: true,
        parentProfile: true,
      },
      omit: {
        passwordHash: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Users fetched successfully", data: users });
  } catch (error: any) {
    console.error("Get Users Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get User By ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: id as string },
      include: {
        school: true,
        studentProfile: true,
        teacherProfile: true,
        parentProfile: true,
      },
      omit: {
        passwordHash: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res
      .status(200)
      .json({ message: "User fetched successfully", data: user });
  } catch (error: any) {
    console.error("Get User By ID Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update User
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, avatarUrl, isActive, role } = req.body;

    const user = await prisma.user.findUnique({ where: { id: id as string } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id as string },
      data: {
        firstName: firstName !== undefined ? firstName : user.firstName,
        lastName: lastName !== undefined ? lastName : user.lastName,
        phone: phone !== undefined ? phone : user.phone,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : user.avatarUrl,
        isActive: isActive !== undefined ? isActive : user.isActive,
        role: role !== undefined ? role : user.role,
      },
      omit: {
        passwordHash: true,
      },
    });

    return res
      .status(200)
      .json({ message: "User updated successfully", data: updatedUser });
  } catch (error: any) {
    console.error("Update User Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete User
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: id as string } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    await prisma.user.update({
      where: { id: id as string },
      data: { isActive: false },
    });

    return res.status(200).json({ message: "User deactivated successfully." });
  } catch (error: any) {
    console.error("Delete User Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import { deleteFromCloudinary } from "@/services/cloudinary.service";
import { createUserService, updateUserService } from "@/services/user.service";
import type { NextFunction, Request, Response } from "express";

// Get All Users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const schoolId = req.query.schoolId as string | undefined;
    const role = req.query.role as string | undefined;
    const search = (req.query.search as string) || "";
    const enrolled = req.query.enrolled as string | undefined;
    const hasTeacherProfile = req.query.hasTeacherProfile as string | undefined;
    const hasParentProfile = req.query.hasParentProfile as string | undefined;
    const status = req.query.status as string | undefined;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder =
      (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    const andConditions: any[] = [];

    andConditions.push({
      role: {
        not: "SUPER_ADMIN",
      },
    });

    if (schoolId) {
      andConditions.push({ schoolId });
    }
    if (role) {
      andConditions.push({ role });
    }

    if (status !== undefined) {
      const isStatus = status === "true";
      andConditions.push({ isActive: isStatus });
    }

    // --- Student Profile Filter ---
    if (enrolled !== undefined) {
      const isEnrolled = enrolled === "true";
      andConditions.push({
        studentProfile: isEnrolled ? { isNot: null } : { is: null },
      });
    }

    // --- Teacher Profile Filter ---
    if (hasTeacherProfile !== undefined) {
      const hasProfile = hasTeacherProfile === "true";
      andConditions.push({
        teacherProfile: hasProfile
          ? {
              isNot: null,
              // enrollments: { some: {} }
            }
          : { is: null },
      });
    }

    // --- Parent Profile Filter ---
    if (hasParentProfile !== undefined) {
      const hasProfile = hasParentProfile === "true";
      andConditions.push({
        parentProfile: hasProfile ? { isNot: null } : { is: null },
      });
    }

    if (search) {
      andConditions.push({
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
        ],
      });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const [users, totalCount] = await prisma.$transaction([
      prisma.user.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
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
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      data: users,
    });
  } catch (error: any) {
    console.error("Get Users Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get User By ID
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
      return next(new AppError("User not found.", 404));
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

// Create User (Register)
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { schoolId, email, role, firstName, lastName, phone } = req.body;

    if (!schoolId || !email || !role || !firstName || !lastName) {
      return next(new AppError("Missing required fields.", 400));
    }
    const isActive = req.body.isActive === "true" || req.body.isActive === true;
    const newUser = await createUserService({
      schoolId,
      email,
      role,
      firstName,
      lastName,
      phone,
      isActive,
      file: req.file,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: newUser,
    });
  } catch (error: any) {
    console.error("Create User Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update User
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { schoolId, email, role, firstName, lastName, phone } = req.body;

    const isActive = req.body.isActive === "true" || req.body.isActive === true;
    const removeLogo =
      req.body.removeLogo === "true" || req.body.removeLogo === true;

    const updatedUser = await updateUserService({
      id: id as string,
      schoolId,
      email,
      firstName,
      lastName,
      phone,
      isActive,
      file: req.file,
      removeLogo,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Update User Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete User
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: id as string } });
    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    //delete image from s3
    if (user.avatarUrl) {
      await deleteFromCloudinary(user.avatarUrl);
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    return res
      .status(204)
      .json({ success: true, message: "User deactivated successfully." });
  } catch (error: any) {
    console.error("Delete User Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

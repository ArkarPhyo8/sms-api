import { AppError } from "@/errors/app.error";
import { prisma } from "@/lib/prisma";
import { deleteFromCloudinary } from "@/services/cloudinary.service";
import {
  createSchoolService,
  updateSchoolService,
} from "@/services/school.service";
import type { NextFunction, Request, Response } from "express";

//get all school
export const getAllSchool = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";
  const status = req.query.status as string | undefined;

  const skip = (page - 1) * limit;

  const andConditions: any[] = [];
  console.log("status--->", status);

  if (status !== undefined) {
    const isStatus = status === "true";
    andConditions.push({ isActive: isStatus });
  }
  
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { address: { contains: search, mode: "insensitive" as const } },
      ],
    });
  }
  const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};
  const [schools, totalCount] = await prisma.$transaction([
    prisma.school.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),

    prisma.school.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    success: true,
    message: "Schools retrieved successfully",
    meta: {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    data: schools,
  });
};

//create school
export const createSchool = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, code, email, phone, address } = req.body;

  const isActive = req.body.isActive === "true" || req.body.isActive === true;
  // console.log("Body data:", req.body);
  // console.log("Uploaded logo file:", req.file);

  const newSchool = await createSchoolService({
    name,
    code,
    email,
    phone,
    address,
    isActive,
    file: req.file,
  });

  res.status(201).json({
    success: true,
    message: "school create is successfully",
    data: newSchool,
  });
};

//update school
export const updateSchool = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const { name, code, email, phone, address } = req.body;

  const isActive =
    req.body.isActive !== undefined
      ? req.body.isActive === "true" || req.body.isActive === true
      : undefined;
  const removeLogo =
    req.body.removeLogo === "true" || req.body.removeLogo === true;

  // console.log("Update Body data:", req.body);
  // console.log("New uploaded logo file:", req.file);

  const updatedSchool = await updateSchoolService({
    id: id as string,
    name,
    code,
    email,
    phone,
    address,
    isActive,
    file: req.file,
    removeLogo,
  });

  return res.status(200).json({
    success: true,
    message: "School updated successfully",
    data: updatedSchool,
  });
};

//delete school
export const deleteSchool = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const school = await prisma.school.findUnique({
    where: {
      id: id as string,
    },
  });
  if (!school) {
    return next(new AppError("school not found", 404));
  }
  //delete image from s3
  if (school.logoUrl) {
    await deleteFromCloudinary(school.logoUrl);
  }
  await prisma.school.delete({
    where: {
      id: id as string,
    },
  });

  return res.status(204).json({
    success: true,
    message: "School is delete successfully",
  });
};

import { prisma } from "@/lib/prisma";
import type { Request, Response } from "express";

const getAllSchool = async (req: Request, res: Response) => {
  //get school in this db
  const response = await prisma.school.findMany();

  res.status(201).json({
    message: "Getting school is successfully",
    data: response,
  });
};

const createSchool = async (req: Request, res: Response) => {
  const { name, code, email, phone, address, logoUrl, isActive } = req.body;

  //check if school already exists in thi database
  const schoolExist = await prisma.school.findUnique({
    where: { code },
  });

  if (schoolExist) {
    res.status(400).json({ message: "school already exists with this code" });
  }

  //create school in this db
  const newSchool = await prisma.school.create({
    data: {
      name,
      code,
      email,
      phone,
      address,
      logoUrl,
      isActive,
    },
  });

  res.status(201).json({
    message: "school create is successfully",
    data: newSchool,
  });
};

export { getAllSchool, createSchool };

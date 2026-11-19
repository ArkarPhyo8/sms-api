import { AppError } from "@/errors/app.error";
import { prisma } from "../lib/prisma";
import { deleteFromCloudinary, uploadToCloudinary } from "./cloudinary.service";

interface CreateSchoolInput {
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  file?: Express.Multer.File;
}

export const createSchoolService = async (data: CreateSchoolInput) => {
  const { name, code, email, phone, address, isActive, file } = data;

  const schoolExist = await prisma.school.findUnique({
    where: { code },
  });

  if (schoolExist) {
    throw new AppError("School already exists with this code", 400);
  }

  let logoUrl = null;

  if (file) {
    try {
      logoUrl = await uploadToCloudinary(file.buffer, "schools/logos");
    } catch (error) {
      throw new AppError("Failed to upload logo image to cloud storage", 500);
    }
  }

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

  return newSchool;
};

interface UpdateSchoolInput {
  id: string;
  name?: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  file?: Express.Multer.File;
  removeLogo?: boolean;
}
export const updateSchoolService = async (data: UpdateSchoolInput) => {
  const { id, code, name, email, phone, address, isActive, file, removeLogo } =
    data;
  //   console.log("Update->><<< data:", data);

  // ၁။ ကျောင်း ရှိမရှိ အရင်စစ်ဆေးခြင်း
  const existingSchool = await prisma.school.findUnique({
    where: { id },
  });

  if (!existingSchool) {
    throw new AppError("School not found", 404);
  }

  let logoUrl = existingSchool.logoUrl; // ပုံစံဟောင်းကို ပုံသေမှတ်ထားမည်

  // ၂။ အကယ်၍ ပုံအသစ် တင်လာခဲ့လျှင်
  if (file) {
    // 2.1 ပုံဟောင်း ရှိခဲ့ပါက Cloudinary မှ အရင်ဖျက်မည်
    if (existingSchool.logoUrl) {
      await deleteFromCloudinary(existingSchool.logoUrl);
    }
    // 2.2 ပုံအသစ်ကို Cloudinary တင်ပြီး URL အသစ် ယူမည်
    logoUrl = await uploadToCloudinary(file.buffer, "schools/logos");
  }
  // ၃။ ပုံအသစ်လည်းမပါ၊ Frontend က ပုံကို ဖျက်ခိုင်းထားလျှင် (removeLogo === true)
  else if (removeLogo) {
    if (existingSchool.logoUrl) {
      await deleteFromCloudinary(existingSchool.logoUrl);
    }
    logoUrl = null; // သို့မဟုတ် null (DB schema ပေါ်မူတည်သည်)
  }

  //   console.log("Update----> data:", {
  //     code,
  //     name,
  //     email,
  //     phone,
  //     address,
  //     isActive,
  //     logoUrl,
  //   });
  // ၄။ Database ထဲတွင် အချက်အလက်များ Update လုပ်ခြင်း
  const updatedSchool = await prisma.school.update({
    where: { id },
    data: {
      code,
      name,
      email,
      phone,
      address,
      isActive,
      logoUrl,
    },
  });

  return updatedSchool;
};

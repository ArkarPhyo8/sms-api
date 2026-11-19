import { PrismaClient } from "@prisma/client";
type ModelName = keyof PrismaClient;

interface GenerateIdOptions {
  prisma: Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >;
  modelName: string;
  schoolId: string;
  prefix?: string;
}

export const generateCustomId = async ({
  prisma,
  modelName,
  schoolId,
  prefix = "ID",
}: GenerateIdOptions): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const modelDelegate = (prisma as Record<string, any>)[modelName];

  if (!modelDelegate || typeof modelDelegate.findFirst !== "function") {
    throw new Error(`Invalid model name: ${modelName}`);
  }

  const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);

  let dateField = "createdAt";
  if (modelName.toLowerCase().includes("student")) {
    dateField = "admissionDate";
  } else if (modelName.toLowerCase().includes("teacher")) {
    dateField = "joiningDate";
  }

  let idField = "admissionNumber";
  if (modelName.toLowerCase().includes("teacher")) {
    idField = "employeeId";
  }

  // console.log("modelDelegate--->", modelDelegate);
  let retries = 3;

  while (retries > 0) {
    try {
      const lastRecord = await modelDelegate.findFirst({
        where: {
          schoolId: schoolId,
          [dateField]: {
            gte: startOfYear,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          [idField]: true,
        },
      });
      let nextNumber = 1;
      const lastIdValue = lastRecord ? lastRecord[idField] : null;
      if (lastIdValue) {
        const parts = lastIdValue.split("-");
        const lastNumStr = parts[parts.length - 1];
        const parsedNum = parseInt(lastNumStr, 10);

        if (!isNaN(parsedNum)) {
          nextNumber = parsedNum + 1;
        }
      }
      const paddedNumber = String(nextNumber).padStart(4, "0");
      const generatedId = `${prefix}-${currentYear}-${paddedNumber}`;

      return generatedId;
    } catch (error: any) {
      retries--;
      if (retries === 0) {
        throw new Error(
          `Failed to generate unique ID after multiple attempts: ${error.message}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  throw new Error("ID generation failed unexpectedly.");
};

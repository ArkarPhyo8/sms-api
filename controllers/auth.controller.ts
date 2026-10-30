import { prisma } from "@/lib/prisma";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generateRefreshToken, generateToken } from "@/utils/generateToken";
import { AppError } from "@/errors/app.error";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
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

  //check if user already exists in this database
  const registerExist = await prisma.user.findUnique({
    where: { email },
  });

  if (registerExist) {
    res.status(400).json({ message: "User already exists with this email" });
  }

  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //create new user in this database
  const newRegister = await prisma.user.create({
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
      lastLogin: new Date(),
    },
  });

  const { passwordHash, ...response } = newRegister;
  res.status(201).json({
    message: "Register is successfully",
    data: { ...response },
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    //check user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        school: true,
        studentProfile: true,
        teacherProfile: true,
        parentProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ message: "Invalid email or account is inactive." });
    }

    //Password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    //update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
      },
    });

    // Generate JWT Token
    const payload = {
      uid: user.id,
      em: user.email,
      r: user.role,
      sid: user.schoolId,
    };
    const token = generateToken({ payload });

    //Generate Refresh JWT Token
    const refreshToken = generateRefreshToken(user.id);

    //Refresh token save to database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    const { passwordHash, ...userResponse } = user;
    return res.status(200).json({
      message: "Login successful",
      access_token: token,
      refresh_token: refreshToken,
      data: userResponse,
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect old password." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedNewPassword,
      },
    });

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error: any) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//Refresh Token Endpoint
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const refresh_secret = process.env.REFRESH_SECRET;
    if (!refreshToken) {
      throw new AppError("Refresh Token is required.", 400);
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
      include: {
        user: true,
      },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError("Invalid or expired refresh token.", 403);
    }
    if (!refresh_secret) {
      throw new AppError(
        "refresh secret is not defined in environment variables",
        500,
      );
    }

    //Refresh Token verify
    jwt.verify(refreshToken, refresh_secret, async (err: any, decoded: any) => {
      if (err) {
        throw new AppError("Invalid refresh token", 403);
      }
      const user = storedToken.user;
      if (!user || !user.isActive) {
        throw new AppError("User not found or inactive", 403);
      }

      //generate new access token
      const payload = {
        uid: user.id,
        em: user.email,
        r: user.role,
        sid: user.schoolId,
      };
      const newAccessToken = generateToken({ payload });

      res.status(200).json({
        accessToken: newAccessToken,
      });
    });
  } catch (error: any) {
    console.error("Refresh Token Error:", error);
    throw new AppError("Interval server error", 500);
  }
};

//Logout endpoint
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error: any) {
    throw new AppError("Internal server error", 500);
  }
};

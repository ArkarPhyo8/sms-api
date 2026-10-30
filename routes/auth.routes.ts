import {
  changePassword,
  login,
  logout,
  refreshToken,
} from "@/controllers/auth.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import express from "express";

const router = express.Router();

router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

router.post("/change-password", authMiddleware, changePassword);

export default router;

import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";
import { upload } from "@/middleware/upload.middleware";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", upload.single("avatarUrl"), createUser);
router.put("/:id", upload.single("avatarUrl"), updateUser);
router.delete("/:id", deleteUser);

export default router;

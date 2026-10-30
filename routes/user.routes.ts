import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";

const router = Router();

router.post("/", createUser); // Create User
router.get("/", getUsers); // Get All Users (with optional query: ?schoolId=xxx&role=STUDENT)
router.get("/:id", getUserById); // Get User By ID
router.put("/:id", updateUser); // Update User
router.delete("/:id", deleteUser); // Delete/Deactivate User

export default router;

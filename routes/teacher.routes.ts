import {
  createTeacher,
  deleteTeacher,
  getTeacher,
  getTeacherById,
  updateTeacher,
} from "@/controllers/teacher.controller";
import { Router } from "express";

const router = Router();

router.get("/", getTeacher);
router.get("/:id", getTeacherById);
router.post("/", createTeacher);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);

export default router;

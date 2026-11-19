import {
  createStudent,
  deleteStudent,
  getStudent,
  getStudentById,
  updateStudent,
} from "@/controllers/student.controller";
import { Router } from "express";

const router = Router();

router.get("/", getStudent);
router.get("/:id", getStudentById);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;

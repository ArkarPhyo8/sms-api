import {
  createExam,
  deleteExam,
  getExam,
  getExamById,
  updateExam,
} from "@/controllers/exam.controller";
import { Router } from "express";

const router = Router();

router.get("/", getExam);
router.get("/:id", getExamById);
router.post("/", createExam);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);

export default router;

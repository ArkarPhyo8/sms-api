import {
  createExamResult,
  deleteExamResult,
  getExamResult,
  getExamResultById,
  updateExamResult,
} from "@/controllers/exam-result.controller";
import { Router } from "express";

const router = Router();

router.get("/", getExamResult);
router.get("/:id", getExamResultById);
router.post("/", createExamResult);
router.put("/:id", updateExamResult);
router.delete("/:id", deleteExamResult);

export default router;

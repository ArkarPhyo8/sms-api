import {
  createGradeLevel,
  deleteGradeLevel,
  getGradeLevel,
  getGradeLevelById,
  updateGradeLevel,
} from "@/controllers/grade-level.controller";
import { Router } from "express";

const router = Router();

router.get("/", getGradeLevel);
router.get("/:id", getGradeLevelById);
router.post("/", createGradeLevel);
router.put("/:id", updateGradeLevel);
router.delete("/:id", deleteGradeLevel);

export default router;

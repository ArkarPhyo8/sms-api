import {
  createSubject,
  deleteSubject,
  getSubject,
  getSubjectById,
  updateSubject,
} from "@/controllers/subject.controller";
import { Router } from "express";

const router = Router();

router.get("/", getSubject);
router.get("/:id", getSubjectById);
router.post("/", createSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

export default router;

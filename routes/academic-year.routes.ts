import {
  createAcademicYear,
  deleteAcademicYear,
  getAcademicYear,
  getAcademicYearById,
  updateAcademicYear,
} from "@/controllers/academic-year.controller";
import { Router } from "express";

const router = Router();

router.get("/", getAcademicYear);
router.get("/:id", getAcademicYearById);
router.post("/", createAcademicYear);
router.put("/:id", updateAcademicYear);
router.delete("/:id", deleteAcademicYear);

export default router;

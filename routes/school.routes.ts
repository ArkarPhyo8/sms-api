import {
  createSchool,
  deleteSchool,
  getAllSchool,
  updateSchool,
} from "@/controllers/school.controller";
import { upload } from "@/middleware/upload.middleware";
import express from "express";

const router = express.Router();

router.get("/", getAllSchool);
router.post("/", upload.single("logoUrl"), createSchool);
router.put("/:id", upload.single("logoUrl"), updateSchool);
router.delete("/:id", deleteSchool);

export default router;

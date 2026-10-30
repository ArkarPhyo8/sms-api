import { createSchool, getAllSchool } from "@/controllers/school.controller";
import express from "express";

const router = express.Router();

router.get("/", getAllSchool);
router.post("/", createSchool);

export default router;

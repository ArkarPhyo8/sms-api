import {
  createAttendance,
  deleteAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
} from "@/controllers/attendance.controller";
import { Router } from "express";

const router = Router();

router.get("/", getAttendance);
router.get("/:id", getAttendanceById);
router.post("/", createAttendance);
router.put("/:id", updateAttendance);
router.delete("/:id", deleteAttendance);

export default router;

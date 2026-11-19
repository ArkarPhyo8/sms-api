import {
  createTimeTable,
  deleteTimeTable,
  getTimeTable,
  updateTimeTable,
} from "@/controllers/time-table.controller";
import { Router } from "express";

const router = Router();

router.get("/", getTimeTable);
router.get("/:id", getTimeTable);
router.post("/", createTimeTable);
router.put("/:id", updateTimeTable);
router.delete("/:id", deleteTimeTable);

export default router;

import {
  createFeeStructure,
  deleteFeeStructure,
  getFeeStructure,
  getFeeStructureById,
  updateFeeStructure,
} from "@/controllers/fee-structure.controller";
import { Router } from "express";

const router = Router();

router.get("/", getFeeStructure);
router.get("/:id", getFeeStructureById);
router.post("/", createFeeStructure);
router.put("/:id", updateFeeStructure);
router.delete("/:id", deleteFeeStructure);

export default router;

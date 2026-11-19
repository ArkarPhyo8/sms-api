import {
  createTerm,
  deleteTerm,
  getTerm,
  getTermById,
  updateTerm,
} from "@/controllers/term.controller";
import { Router } from "express";

const router = Router();

router.get("/", getTerm);
router.get("/:id", getTermById);
router.post("/", createTerm);
router.put("/:id", updateTerm);
router.delete("/:id", deleteTerm);

export default router;

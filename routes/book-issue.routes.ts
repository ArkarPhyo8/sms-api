import {
  createBookIssue,
  deleteBookIssue,
  getBookIssue,
  getBookIssueById,
  updateBookIssue,
} from "@/controllers/book-issue.controller";
import { Router } from "express";

const router = Router();

router.get("/", getBookIssue);
router.get("/:id", getBookIssueById);
router.post("/", createBookIssue);
router.put("/:id", updateBookIssue);
router.delete("/:id", deleteBookIssue);

export default router;

import {
  createBook,
  deleteBook,
  getBook,
  getBookById,
  updateBook,
} from "@/controllers/book.controller";
import { Router } from "express";

const router = Router();

router.get("/", getBook);
router.get("/:id", getBookById);
router.post("/", createBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

export default router;

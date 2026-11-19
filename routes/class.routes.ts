
import { createClass, deleteClass, getClass, getClassById, updateClass } from "@/controllers/class.controller";
import { Router } from "express";

const router = Router();

router.get("/", getClass);
router.get("/:id", getClassById);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;

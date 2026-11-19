
import { createParent, deleteParent, getParent, getParentById, updateParent } from "@/controllers/parent.controller";
import { Router } from "express";

const router = Router();

router.get("/", getParent);
router.get("/:id", getParentById);
router.post("/", createParent);
router.put("/:id", updateParent);
router.delete("/:id", deleteParent);

export default router;

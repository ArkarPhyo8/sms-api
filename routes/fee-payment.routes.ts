import {
  createFeePayment,
  deleteFeePayment,
  getFeePayment,
  getFeePaymentById,
  updateFeePayment,
} from "@/controllers/fee-payment.controller";
import { Router } from "express";

const router = Router();

router.get("/", getFeePayment);
router.get("/:id", getFeePaymentById);
router.post("/", createFeePayment);
router.put("/:id", updateFeePayment);
router.delete("/:id", deleteFeePayment);

export default router;

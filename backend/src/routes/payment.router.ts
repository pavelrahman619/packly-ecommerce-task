import express from "express";
import {
  createPaymentIntent,
  confirmPayment,
} from "../controllers/payment.controller";

const router = express.Router();

router.post("/create-intent", createPaymentIntent);
router.post("/confirm", confirmPayment);

export default router;
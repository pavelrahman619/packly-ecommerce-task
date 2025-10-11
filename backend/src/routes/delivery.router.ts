import express from "express";
import {
  validateAddress,
  calculateDeliveryCost,
} from "../controllers/delivery.controller";

const router = express.Router();

router.post("/validate-address", validateAddress);
router.post("/calculate-cost", calculateDeliveryCost);

export default router;


import express from "express";
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  trackOrder,
} from "../controllers/order.controller";

const router = express.Router();

router.get("/", getOrders);
router.get("/:id", getOrder);
router.post("/", createOrder);
router.put("/:id/status", updateOrderStatus);
router.get("/:id/track", trackOrder);

export default router;


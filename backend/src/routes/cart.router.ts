import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
  syncCart,
} from "../controllers/cart.controller";

const router = express.Router();

// Cart CRUD operations
router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove", removeFromCart);
router.delete("/clear", clearCart);

// Cart sync operations
router.post("/merge", mergeCart);  // Merge local cart with backend cart (on login)
router.post("/sync", syncCart);    // Full sync - replace backend cart with local

export default router;


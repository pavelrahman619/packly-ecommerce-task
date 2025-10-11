import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductStock,
  updateProductStock,
} from "../controllers/product.controller";

const router = express.Router();

// Product CRUD routes
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/:id", getProduct);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Stock management routes
router.get("/:id/stock", getProductStock);
router.put("/:id/stock", updateProductStock);

export default router;


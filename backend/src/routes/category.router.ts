import express from "express";
import {
  getCategories,
  getCategoryProducts,
} from "../controllers/category.controller";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id/products", getCategoryProducts);

export default router;


import express from "express";
import {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  reorderContent,
  bulkReorderContent,
} from "../controllers/content.controller";
import {
  validateCreateContent,
  validateUpdateContent,
  validateQuery,
  validateReorder,
  validateBulkReorder,
  validateGetById,
  validateDelete,
} from "../middleware/validation.middleware";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", validateQuery, getAllContent);
router.get("/:id", validateGetById, getContentById);

// Admin routes (temporarily without authentication for testing)
router.post("/", validateCreateContent, createContent);
router.put("/:id", validateUpdateContent, updateContent);
router.delete("/:id", validateDelete, deleteContent);
router.patch("/:id/order", validateReorder, reorderContent);
router.post("/bulk-reorder", validateBulkReorder, bulkReorderContent);

export default router;


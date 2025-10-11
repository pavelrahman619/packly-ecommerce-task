import express from "express";
import {
  uploadImage,
  uploadBulkImages,
} from "../controllers/upload.controller";

const router = express.Router();

router.post("/image", uploadImage);
router.post("/bulk-images", uploadBulkImages);

export default router;


import express from "express";
import {
  getDashboard,
} from "../controllers/admin.controller";

const router = express.Router();

router.get("/dashboard", getDashboard);

export default router;


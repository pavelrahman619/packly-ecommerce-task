import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  editUser,
  deleteUser,
} from "../controllers/user.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", authMiddleware, getUserById);
router.post("/", createUser);
router.put("/:id", authMiddleware, editUser);
router.delete("/:id", deleteUser);

export default router;

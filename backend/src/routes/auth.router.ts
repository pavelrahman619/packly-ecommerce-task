import express from "express";
import {
  login,
  logout,
  verify,
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/verify", verify);

export default router;

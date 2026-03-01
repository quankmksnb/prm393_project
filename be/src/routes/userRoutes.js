import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👤 Profile routes
router.get("/me", protect, getProfile);
router.put("/update", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;

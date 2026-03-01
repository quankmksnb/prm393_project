// src/routes/categoryRoutes.js
import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { protect, sellerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, sellerOnly, createCategory);
router.put("/:id", protect, sellerOnly, updateCategory);

export default router;

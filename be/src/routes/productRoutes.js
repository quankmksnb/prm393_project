// src/routes/productRoutes.js
import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, sellerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, sellerOnly, createProduct);
router.put("/:id", protect, sellerOnly, updateProduct);
router.delete("/:id", protect, sellerOnly, deleteProduct);

export default router;

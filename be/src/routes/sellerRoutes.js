// src/routes/sellerRoutes.js
import express from "express";
import { getAllOrders, getAllUsers, getOrderByIdBySeller } from "../controllers/sellerController.js";
import { protect, sellerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📦 Xem tất cả đơn hàng
router.get("/orders", protect, sellerOnly, getAllOrders);

// 👤 Xem tất cả người dùng
router.get("/users", protect, sellerOnly, getAllUsers);
router.get("/orders/:id", protect, sellerOnly, getOrderByIdBySeller);

export default router;

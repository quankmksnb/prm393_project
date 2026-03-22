// src/routes/sellerRoutes.js
import express from "express";
import { getAllOrders, getAllUsers, getOrderByIdBySeller, getStatistics } from "../controllers/sellerController.js";
import { exportOrders } from "../controllers/reportController.js";
import { protect, sellerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🟢 Export dữ liệu đơn hàng sang CSV
router.get("/export-orders", protect, sellerOnly, exportOrders);

// 📦 Xem tất cả đơn hàng
router.get("/orders", protect, sellerOnly, getAllOrders);

// 📈 Thống kê báo cáo
router.get("/stats", protect, sellerOnly, getStatistics);

// 👤 Xem tất cả người dùng
router.get("/users", protect, sellerOnly, getAllUsers);
router.get("/orders/:id", protect, sellerOnly, getOrderByIdBySeller);

export default router;

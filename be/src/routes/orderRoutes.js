import express from "express";
import {
  checkout,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect, sellerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, checkout);
router.get("/", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, sellerOnly, updateOrderStatus);
router.put("/:id/cancel", protect, cancelOrder);

export default router;

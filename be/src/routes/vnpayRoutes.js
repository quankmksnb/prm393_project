import express from "express";
import { createPaymentUrl, verifyReturnUrl } from "../controllers/vnpayController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tạo URL thanh toán VNPay
router.post("/create_payment_url", protect, createPaymentUrl);

// Xác thực URL trả về (Webhook/IPN hoặc App gửi lên)
router.post("/verify_return", protect, verifyReturnUrl);

export default router;

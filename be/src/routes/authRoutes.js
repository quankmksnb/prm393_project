// src/routes/authRoutes.js
import express from "express";
import { registerUser, loginUser, verifyOtp, resendOtp, logoutUser, forgotPassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser); 
router.post("/forgot-password", forgotPassword);

export default router;

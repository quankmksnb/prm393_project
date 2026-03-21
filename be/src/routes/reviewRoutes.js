import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import Review from "../models/Review.js";

const router = express.Router();

// 🟢 Gửi đánh giá mới
router.post("/", protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    console.log("📝 New Review Request:", { productId, rating, comment, userId: req.user.id });
    
    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating,
      comment,
    });

    const populatedReview = await review.populate("user", "name avatar");
    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("❌ Post Review Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🟢 Lấy danh sách đánh giá của sản phẩm
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🟢 Lấy tất cả đánh giá (Dành cho Seller)
router.get("/all", protect, async (req, res) => {
  try {
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    const reviews = await Review.find({})
      .populate("user", "name avatar")
      .populate("product", "name image")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;

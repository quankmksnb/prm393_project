import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import Message from "../models/Message.js";

const router = express.Router();

// 🟢 Lấy lịch sử chat giữa User và Seller
router.get("/history/:otherId", protect, async (req, res) => {
  try {
    const { otherId } = req.params;
    const userId = req.user.id;

    // Room name convention: user1Id_user2Id (sorted to be consistent)
    const ids = [userId.toString(), otherId.toString()].sort();
    const room = ids.join("_");

    const messages = await Message.find({ room }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Get History Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🟢 Lấy danh sách các cuộc hội thoại (dành cho Seller)
router.get("/conversations", protect, async (req, res) => {
  try {
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
    }
    
    // Aggregation to find unique users who messaged the seller
    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: new mongoose.Types.ObjectId(req.user.id) }, { receiver: new mongoose.Types.ObjectId(req.user.id) }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(req.user.id)] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$content" },
          lastTime: { $first: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          id: "$_id",
          lastMessage: 1,
          lastTime: 1,
          "userInfo.id": "$userInfo._id",
          "userInfo.name": 1,
          "userInfo.email": 1,
          "userInfo.avatar": 1
        }
      }
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;

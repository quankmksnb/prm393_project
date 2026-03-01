// src/controllers/sellerController.js
import Order from "../models/Order.js";
import User from "../models/User.js";

// 🟢 Get all orders (seller only)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email role")
      .populate("deliveryAddress");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Get all users (seller only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Seller xem chi tiết 1 order bất kỳ
export const getOrderByIdBySeller = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name image price")
      .populate("deliveryAddress");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Chỉ seller hoặc admin mới có quyền
    if (req.user.role !== "seller" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only sellers can access this" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("❌ getOrderByIdBySeller error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


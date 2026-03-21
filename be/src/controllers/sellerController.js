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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📈 Get Comprehensive Statistics for Seller Dashboard
export const getStatistics = async (req, res) => {
  try {
    // 1. Calculate General Stats
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const totalUsers = await User.countDocuments({ role: "user" });

    // Revenue logic: Only Completed orders OR Paid orders (VNPay success)
    const revenueData = await Order.aggregate([
      {
        $match: {
          $or: [
            { status: "completed" },
            { isPaid: true }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // 2. Revenue by day (Last 30 days) for Chart
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenueByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          $or: [
            { status: "completed" },
            { isPaid: true }
          ]
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 3. Status Breakdown
    const statusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // 4. Top Selling Products (Filtered by status 'completed' and period)
    const { period } = req.query;
    let startDate = new Date();
    if (period === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      // Default to 30 days if not specified or different
      startDate.setDate(startDate.getDate() - 30);
    }

    const topProducts = await Order.aggregate([
      { 
        $match: { 
          status: "completed",
          createdAt: { $gte: startDate }
        } 
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productName",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 } // Increased to 10 for better view
    ]);

    res.status(200).json({
      summary: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        totalUsers
      },
      dailyRevenue: dailyRevenueByDay,
      statusBreakdown,
      topProducts
    });
  } catch (error) {
    console.error("Seller Stats Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


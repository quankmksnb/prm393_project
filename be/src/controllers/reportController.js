import Order from "../models/Order.js";
import { json2csv } from "json-2-csv";

// 🟢 Export Orders to CSV
export const exportOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const dataToExport = orders.map((order) => ({
      ID: order._id.toString(),
      KhachHang: order.user?.name || "N/A",
      Email: order.user?.email || "N/A",
      TongTien: order.totalAmount,
      TrangThai: order.status,
      PhuongThucThanhToan: order.paymentMethod,
      NgayTao: order.createdAt.toLocaleString("vi-VN"),
    }));

    const csv = json2csv(dataToExport);

    res.header("Content-Type", "text/csv");
    res.attachment("baocao-donhang.csv");
    return res.send(csv);
  } catch (error) {
    console.error("❌ Export Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

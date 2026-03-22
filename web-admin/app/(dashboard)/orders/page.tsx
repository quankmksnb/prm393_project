"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { format } from "date-fns";
import { Eye, Clock, CheckCircle, Truck, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/seller/orders");
      // Sắp xếp đơn mới nhất lên đầu
      const sorted = res.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(sorted);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700"><Clock className="h-3 w-3"/> Chờ xác nhận</span>;
      case "confirmed":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"><CheckCircle className="h-3 w-3"/> Đã xác nhận</span>;
      case "delivering":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-2 py-1 text-xs font-medium text-teal-700"><Truck className="h-3 w-3"/> Đang giao</span>;
      case "completed":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"><CheckCircle2 className="h-3 w-3"/> Hoàn thành</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"><XCircle className="h-3 w-3"/> Đã huỷ</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{status}</span>;
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const statuses = [
    { id: "all", label: "Tất cả", count: orders.length },
    { id: "pending", label: "Chờ xác nhận", count: orders.filter(o => o.status === "pending").length },
    { id: "confirmed", label: "Đã xác nhận", count: orders.filter(o => o.status === "confirmed").length },
    { id: "delivering", label: "Đang giao", count: orders.filter(o => o.status === "delivering").length },
    { id: "completed", label: "Hoàn thành", count: orders.filter(o => o.status === "completed").length },
    { id: "cancelled", label: "Đã huỷ", count: orders.filter(o => o.status === "cancelled").length },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === s.id
                  ? "bg-teal-600 text-white shadow-md transform scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {s.label} ({s.count})
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Mã Đơn</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Khách hàng</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ngày đặt</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tổng tiền</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Hành động</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500 italic">
                    Không có đơn hàng nào ở trạng thái này
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      #{order._id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {order.user?.name || "Khách vô danh"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                      ₫{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link href={`/orders/${order._id}`} className="inline-flex items-center justify-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-orange-600 hover:bg-orange-100 ring-1 ring-inset ring-orange-600/20">
                        <Eye className="w-4 h-4"/> Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

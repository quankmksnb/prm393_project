"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, CreditCard, User } from "lucide-react";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/seller/orders/${id}`);
      setOrder(res.data);
      setStatus(res.data.status);
    } catch (e) {
      toast.error("Không thể tải chi tiết đơn hàng");
    }
  };

  const handleStatusChange = async () => {
    if (!status || status === order.status) return;
    try {
      setSaving(true);
      await api.put(`/orders/${id}/status`, { status });
      toast.success("Cập nhật trạng thái thành công");
      fetchDetail();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  if (!order) return <div className="p-6">Đang tải chi tiết...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <ArrowLeft className="w-5 h-5"/>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Chi tiết Đơn hàng: #{order._id.substring(0,8).toUpperCase()}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Danh sách món ăn</h2>
            <div className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-4">
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"} 
                      alt={item.productName} 
                      className="w-14 h-14 rounded-lg object-cover bg-gray-50" 
                    />
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">₫{item.price.toLocaleString()} x {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">₫{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <span className="font-bold text-gray-700">Tổng thanh toán:</span>
              <span className="text-2xl font-bold text-orange-600">₫{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Status & Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200">
            <h2 className="text-lg font-semibold mb-4 text-orange-800">Cập nhật trạng thái</h2>
            <div className="space-y-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={order.status === 'cancelled' || order.status === 'completed'}
                className="block w-full rounded-md border-gray-300 py-2.5 pl-3 pr-10 text-base focus:border-orange-500 focus:outline-none focus:ring-orange-500 bg-gray-50 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="delivering">Đang giao hàng</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Huỷ đơn</option>
              </select>
              <button
                onClick={handleStatusChange}
                disabled={saving || status === order.status || order.status === 'cancelled' || order.status === 'completed'}
                className="w-full bg-orange-600 text-white font-medium py-2.5 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-lg font-semibold mb-2">Thông tin Giao hàng</h2>
            
            <div className="flex gap-3 text-sm text-gray-600">
              <User className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <p className="font-medium text-gray-900">{order.user?.name || "Khách vô danh"}</p>
                <p>{order.user?.email}</p>
              </div>
            </div>

            {order.deliveryAddress && (
              <div className="flex gap-3 text-sm text-gray-600">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">{order.deliveryAddress.fullName} ({order.deliveryAddress.phone})</p>
                  <p className="mt-1">{order.deliveryAddress.addressLine}</p>
                  <p>{order.deliveryAddress.ward}, {order.deliveryAddress.district}, {order.deliveryAddress.city}</p>
                </div>
              </div>
            )}

             <div className="flex gap-3 text-sm text-gray-600">
              <CreditCard className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Phương thức: {order.paymentMethod}</p>
                <p className="mt-1">Ngày đặt: {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

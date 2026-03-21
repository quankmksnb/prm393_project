"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { User, ShieldCheck, Mail, Phone } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/seller/users");
      setUsers(res.data);
    } catch (error) {
      toast.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Khách hàng</h1>
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Khách hàng</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Liên hệ</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Vai trò</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-orange-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-orange-600" />
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex flex-col space-y-1">
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> {user.email}</span>
                      {user.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> {user.phone}</span>}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {user.role === 'admin' || user.role === 'seller' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">
                        <ShieldCheck className="w-3 h-3" /> Seller/Admin
                      </span>
                    ) : (
                       <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                        User
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.status === 'active' ? 'Hoạt động' : 'Đang chờ'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {format(new Date(user.createdAt), "dd/MM/yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

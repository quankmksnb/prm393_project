"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { Utensils } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      
      if (res.data.user.role !== "seller" && res.data.user.role !== "admin") {
        toast.error("Truy cập bị từ chối. Tài khoản không có quyền Seller/Admin.");
        return;
      }

      // Save token
      Cookies.set("token", res.data.token, { expires: 7 });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      toast.success("Đăng nhập thành công!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
            <Utensils className="h-7 w-7 text-orange-600" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-900">
            Foodify Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Quản trị viên Đăng nhập
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
                placeholder="admin@foodify.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md border border-transparent bg-orange-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

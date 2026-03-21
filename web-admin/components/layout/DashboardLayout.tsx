"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { LayoutDashboard, ShoppingBag, Users, LogOut, Loader2, Menu, Tag, PackageOpen, MessageSquare, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Tổng quan", href: "/", icon: LayoutDashboard },
  { name: "Đơn hàng", href: "/orders", icon: ShoppingBag },
  { name: "Thực đơn", href: "/products", icon: PackageOpen },
  { name: "Danh mục", href: "/categories", icon: Tag },
  { name: "Tin nhắn", href: "/messages", icon: MessageSquare },
  { name: "Đánh giá", href: "/reviews", icon: Star },
  { name: "Khách hàng", href: "/users", icon: Users },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const token = Cookies.get("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
    } else {
      setUser(JSON.parse(userStr));
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!mounted || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r">
          <div className="flex items-center h-16 flex-shrink-0 px-6 border-b">
            <span className="text-xl font-bold text-orange-600">Foodify Admin</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md"
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? "text-orange-600" : "text-gray-400 group-hover:text-gray-500",
                        "flex-shrink-0 -ml-1 mr-3 h-5 w-5"
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t p-4">
            <div className="flex items-center w-full">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs font-medium text-gray-500">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto text-gray-400 hover:text-red-600"
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-4 z-10">
        <span className="text-xl font-bold text-orange-600">Foodify</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:pl-64 flex flex-col pt-16 md:pt-0">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

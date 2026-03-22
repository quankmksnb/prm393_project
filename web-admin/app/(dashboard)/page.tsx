"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  DollarSign, 
  ShoppingBag, 
  Users as UsersIcon, 
  Clock, 
  TrendingUp, 
  Award,
  PieChart as PieChartIcon,
  Download
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(`/seller/stats?period=${period}`);
        setData(response.data);
      } catch (error) {
        console.error("Fetch stats error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period]);
  
  const handleExport = async () => {
    try {
      const response = await api.get('/seller/export-orders', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bao-cao-don-hang.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export error:", error);
      alert("Lỗi khi xuất báo cáo.");
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-gray-600 font-medium">Đang tải dữ liệu phân tích...</span>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-red-500">Không thể tải dữ liệu thống kê.</div>;

  const { summary, dailyRevenue, statusBreakdown, topProducts, categoryRevenue } = data;

  const statCards = [
    { name: "Tổng doanh thu", value: `₫${summary.totalRevenue.toLocaleString()}`, sub: "Đơn đã thanh toán/hoàn tất", icon: DollarSign, color: "bg-green-100 text-green-600" },
    { name: "Tổng đơn hàng", value: summary.totalOrders.toLocaleString(), sub: "Tất cả trạng thái", icon: ShoppingBag, color: "bg-blue-100 text-blue-600" },
    { name: "Đơn chờ xử lý", value: summary.pendingOrders.toLocaleString(), sub: "Cần xác nhận ngay", icon: Clock, color: "bg-orange-100 text-orange-600" },
    { name: "Tổng khách hàng", value: summary.totalUsers.toLocaleString(), sub: "Người dùng đã đăng ký", icon: UsersIcon, color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo Tổng quan</h1>
        <p className="text-gray-500 text-sm mt-1">Dữ liệu được cập nhật theo thời gian thực dựa trên các giao dịch thực tế.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{item.name}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{item.value}</h3>
              <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              <h3 className="text-lg font-bold text-gray-900">Doanh thu 30 ngày gần đây</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  tickFormatter={(val) => `₫${(val/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: any) => [`₫${value.toLocaleString()}`, "Doanh thu"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
          {/* Order Status Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <PieChartIcon className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Trạng thái Đơn hàng</h3>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {statusBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
              {statusBreakdown.map((item: any, index: number) => (
                <div key={item._id} className="flex items-center text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  <div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                  <span>{item._id}: {item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Category */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <PieChartIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Doanh thu theo Danh mục</h3>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="revenue"
                    nameKey="name"
                  >
                    {categoryRevenue.map((entry: any, index: number) => (
                      <Cell key={`cell-cat-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `₫${value?.toLocaleString() || 0}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
              {categoryRevenue.map((item: any, index: number) => (
                <div key={item.name} className="flex items-center text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  <div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{backgroundColor: COLORS[(index + 2) % COLORS.length]}}></div>
                  <span>{item.name}: ₫{item.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-bold text-gray-900">Sản phẩm bán chạy nhất</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Lọc theo:</span>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-sm border-gray-200 rounded-lg focus:ring-teal-500 focus:border-teal-500 py-1 px-3 outline-none"
            >
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
            </select>
            <button 
              onClick={handleExport}
              className="flex items-center space-x-1 bg-teal-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>Xuất bản</span>
            </button>
          </div>
        </div>
        
        {topProducts.length === 0 ? (
          <div className="py-12 text-center text-gray-400">Không có dữ liệu bán hàng cho giai đoạn này.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm font-medium text-gray-400 border-b border-gray-50">
                  <th className="pb-4">Tên sản phẩm</th>
                  <th className="pb-4">Số lượng đã bán</th>
                  <th className="pb-4 text-right">Tổng doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts.map((product: any) => (
                  <tr key={product._id} className="text-sm hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-semibold text-gray-900">{product._id}</td>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                         <span className="text-gray-600 font-medium">{product.totalQuantity} món</span>
                         <div className="flex-1 max-w-[100px] bg-gray-100 rounded-full h-1.5 hidden sm:block">
                            <div 
                              className="bg-teal-500 h-1.5 rounded-full" 
                              style={{width: `${Math.min(100, (product.totalQuantity / topProducts[0].totalQuantity) * 100)}%`}}
                            ></div>
                         </div>
                      </div>
                    </td>
                    <td className="py-4 text-right font-bold text-teal-600">
                      ₫{product.totalRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


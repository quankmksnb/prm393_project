"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      // Sort newest
      const sorted = res.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProducts(sorted);
    } catch (error) {
      toast.error("Không thể tải danh sách Món ăn");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xoá món "${name}" không?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Xoá thành công");
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xoá");
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Thực đơn (Món ăn)</h1>
        <Link 
          href="/products/new"
          className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5"/> Thêm Món Mới
        </Link>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Món ăn</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Danh mục</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Giá bán</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kho</th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-500">Chưa có món ăn nào</td></tr>
              )}
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-4">
                      <img 
                        src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"} 
                        alt={product.name} 
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {product.category?.name || "Không phân loại"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-semibold">
                    ₫{product.price.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {product.stock > 0 ? (
                      <span className="text-emerald-600 font-medium">Còn {product.stock}</span>
                    ) : (
                      <span className="text-red-600 font-medium">Hết hàng</span>
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/products/${product._id}`}
                        className="text-white bg-blue-500 hover:bg-blue-600 p-2 rounded-md transition-colors"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4"/>
                      </Link>
                      <button 
                        onClick={() => handleDelete(product._id, product.name)}
                        className="text-white bg-red-500 hover:bg-red-600 p-2 rounded-md transition-colors"
                        title="Xoá"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
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

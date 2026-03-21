"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Edit2, Archive } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States cho Form Thêm/Sửa
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      toast.error("Không thể tải danh sách Danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      setIsSubmitting(true);
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name, description });
        toast.success("Cập nhật thành công");
      } else {
        await api.post("/categories", { name, description });
        toast.success("Thêm Mới thành công");
      }
      // Reset
      setName("");
      setDescription("");
      setEditingId(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setDescription("");
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Danh mục</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              {editingId ? "Sửa Danh mục" : "Thêm Danh mục Mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Ví dụ: Đồ uống, Món chính..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Mô tả về danh mục này..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : (editingId ? "Cập nhật" : "Thêm Mới")}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Table List */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-white">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Danh mục</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mô tả</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.length === 0 && (
                  <tr><td colSpan={3} className="px-3 py-8 text-center text-gray-500">Chưa có danh mục nào</td></tr>
                )}
                {categories.map((cat) => (
                  <tr key={cat._id} className={editingId === cat._id ? 'bg-orange-50' : ''}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Archive className="w-4 h-4 text-orange-500" />
                        {cat.name}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <p className="truncate max-w-xs">{cat.description || "-"}</p>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button 
                        onClick={() => startEdit(cat)}
                        className="text-orange-600 hover:text-orange-900 bg-orange-50 px-3 py-1.5 rounded-md flex items-center justify-center gap-1 ml-auto transition-colors"
                      >
                       <Edit2 className="w-3.5 h-3.5" /> Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

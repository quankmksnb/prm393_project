"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, UploadCloud, ImageIcon } from "lucide-react";

export default function ProductFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const isNew = id === "new";

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("100");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchProduct();
    }
  }, [id, isNew]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
      if (isNew && res.data.length > 0) {
        setCategory(res.data[0]._id);
      }
    } catch(e) {}
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const p = res.data;
      setName(p.name);
      setDescription(p.description || "");
      setPrice(p.price.toString());
      setStock(p.stock?.toString() || "0");
      setCategory(p.category?._id || p.category);
      setImage(p.image || "");
    } catch (e) {
      toast.error("Không tìm thấy món ăn");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      toast.error("Vui lòng Chọn hoặc tạo mới 1 Danh mục trước!");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name, description, price: Number(price), stock: Number(stock), category, image
      };

      if (isNew) {
        await api.post("/products", payload);
        toast.success("Thêm món ăn thành công!");
      } else {
        await api.put(`/products/${id}`, payload);
        toast.success("Cập nhật món ăn thành công!");
      }
      router.push("/products");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const toastId = toast.loading("Đang tải ảnh lên máy chủ...");
      
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImage(res.data.imageUrl);
      toast.success("Tải ảnh thành công!", { id: toastId });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải ảnh");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-6">Đang tải biểu mẫu...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-5 h-5"/>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Thêm Món Ǎn Mới" : "Chỉnh sửa Món Ǎn"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Tên món ăn <span className="text-red-500">*</span></label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="Ví dụ: Phở Bò Kobe" />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Giá bán (₫) <span className="text-red-500">*</span></label>
                <input required type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="50000" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Số lượng Kho</label>
                <input required type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="100" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Danh mục ẩm thực <span className="text-red-500">*</span></label>
              <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
                <option value="" disabled>-- Chọn Danh mục --</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Mô tả Thành phần</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="Thành phần, hương vị chuẩn vị mẹ nấu..."></textarea>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-gray-800">Hình ảnh minh hoạ</label>
                <label className="cursor-pointer text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
                  {uploading ? "Đang tải..." : <><ImageIcon className="w-4 h-4"/> Chọn file từ máy</>}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
              <input type="url" value={image} onChange={e => setImage(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="Hoặc dán Link URL ảnh vào đây..." />
            </div>
            
            <div className="border-2 border-dashed border-gray-200 rounded-xl h-64 flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative group">
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" onError={() => toast.error("Link ảnh bị lỗi hoặc không hỗ trợ hiển thị")} />
              ) : (
                <div className="text-center text-gray-400">
                  <UploadCloud className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-600"/>
                  <p className="text-sm font-medium">Bạn chưa dán đường Link hình ảnh</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors">
            Hủy bỏ
          </button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-medium disabled:opacity-50 transition-colors shadow-sm">
            {saving ? "Đang xử lý..." : (isNew ? "Tạo Món Ăn Này" : "Lưu Thông Tin Món")}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Star, MessageSquare, User, Package } from "lucide-react";
import { format } from "date-fns";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        // We'll search for all reviews. Backend needs an endpoint for all reviews.
        // For now, let's assume we can fetch them or we'll add the endpoint.
        const res = await api.get("/reviews/all"); // I need to create this endpoint
        setReviews(res.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReviews();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải đánh giá...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Đánh giá</h1>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-2">
           <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
           <span className="font-bold text-lg">4.8</span>
           <span className="text-gray-400 text-sm">/ 5.0 (Tổng 1.2k lượt)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200 text-gray-400">
            Chưa có đánh giá nào từ khách hàng.
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold border border-teal-100">
                    {review.user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                       <h3 className="font-bold text-gray-900">{review.user?.name}</h3>
                       <span className="text-xs text-gray-400">• {format(new Date(review.createdAt), "dd/MM/yyyy")}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-teal-600 bg-teal-50 px-3 py-1 rounded-full text-xs font-medium">
                   <Package className="h-3 w-3" />
                   <span>{review.product?.name}</span>
                </div>
              </div>
              
              <div className="mt-4 text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl italic">
                "{review.comment}"
              </div>

              <div className="mt-4 flex items-center justify-end space-x-3">
                 <button className="text-gray-400 hover:text-orange-500 text-sm font-medium flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Phản hồi
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

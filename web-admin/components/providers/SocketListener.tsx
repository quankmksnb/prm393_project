"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const SOCKET_URL = "http://localhost:1612";

export function SocketListener() {
  const router = useRouter();

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("Connected to Socket.io server");
    });

    socket.on("new_order", (data) => {
      console.log("New order received:", data);
      toast.success(
        (t) => (
          <div className="flex flex-col">
            <span className="font-bold">🔔 {data.message}</span>
            <span className="text-xs text-gray-500">Mã đơn: #{data.orderId.toString().slice(-6)}</span>
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                router.push(`/orders/${data.orderId}`);
              }}
              className="mt-2 text-xs bg-teal-600 text-white px-2 py-1 rounded"
            >
              Xem ngay
            </button>
          </div>
        ),
        { duration: 10000 }
      );
      
      // Phát âm thanh thông báo (tùy chọn)
      try {
        const audio = new Audio("/notification.mp3");
        audio.play();
      } catch (e) {
        console.log("Audio play failed");
      }
    });

    socket.on("order_status_updated", (data) => {
      console.log("Order status updated:", data);
      toast(data.message, { icon: "📦" });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return null; // Component này không render gì cả
}

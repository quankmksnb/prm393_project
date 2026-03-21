"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { io, Socket } from "socket.io-client";
import { Send, User as UserIcon, Search, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }

    const fetchConversations = async () => {
      try {
        const res = await api.get("/chat/conversations");
        setConversations(res.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();

    // Connect Socket
    const newSocket = io("http://localhost:1612");
    setSocket(newSocket);

    // Global listener for new messages to update the list
    newSocket.on("receive_message", (msg: any) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === msg.sender || c.id === msg.receiver);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessage: msg.content,
            lastTime: msg.createdAt,
          };
          // Move to top
          const item = updated.splice(index, 1)[0];
          updated.unshift(item);
          return updated;
        } else {
          // New conversation? Refresh list might be easier
          fetchConversations();
          return prev;
        }
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (selectedUser && socket) {
      // Join room
      const ids = [currentUser.id, selectedUser.id].sort();
      const room = ids.join("_");
      socket.emit("join_room", room);

      // Fetch history
      const fetchHistory = async () => {
        try {
          const res = await api.get(`/chat/history/${selectedUser.id}`);
          setMessages(res.data);
        } catch (error) {
          console.error("Error fetching history:", error);
        }
      };
      fetchHistory();

      // Listen for messages
      const messageHandler = (msg: any) => {
        if (msg.room === room) {
          setMessages((prev) => [...prev, msg]);
        }
      };
      socket.on("receive_message", messageHandler);

      return () => {
        socket.off("receive_message", messageHandler);
      };
    }
  }, [selectedUser, socket, currentUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socket) return;

    const ids = [currentUser.id, selectedUser.id].sort();
    const room = ids.join("_");

    const messageData = {
      sender: currentUser.id,
      receiver: selectedUser.id,
      content: newMessage,
      room: room,
    };

    socket.emit("send_message", messageData);
    setNewMessage("");
  };

  return (
    <div className="h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden">
      {/* Sidebar hội thoại */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Chưa có cuộc hội thọai nào.</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedUser(conv.userInfo)}
                className={cn(
                  "w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-50",
                  selectedUser?.id === conv.id && "bg-orange-50 border-l-4 border-l-orange-500"
                )}
              >
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                  {conv.userInfo.name.charAt(0)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{conv.userInfo.name}</p>
                  <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
                <span className="text-[10px] text-gray-400">
                  {format(new Date(conv.lastTime), "HH:mm")}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Khung chat chính */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedUser.name}</p>
                  <p className="text-xs text-green-500 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Đang trực tuyến
                  </p>
                </div>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => {
                const isMine = msg.sender === currentUser.id;
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col",
                      isMine ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm",
                        isMine
                          ? "bg-orange-500 text-white rounded-tr-none"
                          : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1">
                      {format(new Date(msg.createdAt), "HH:mm")}
                    </span>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t flex items-center space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn của bạn..."
                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-all shadow-md"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <MessageSquare className="h-10 w-10" />
            </div>
            <p>Chọn một khách hàng để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>
    </div>
  );
}

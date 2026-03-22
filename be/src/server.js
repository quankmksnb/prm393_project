import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import deliveryAddressRoutes from "./routes/deliveryAddressRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import vnpayRoutes from "./routes/vnpayRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import Message from "./models/Message.js";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` 
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set('io', io);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api", limiter);

// --- Socket.io Logic --- 
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`👤 User joined room: ${room}`);
  });

  socket.on("join_user", (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on("send_message", async (data) => {
    const { sender, receiver, content, room } = data;
    try {
      const newMessage = await Message.create({ sender, receiver, content, room });
      console.log(`📩 Message sent in room ${room}: ${content}`);
      // Gửi tin nhắn đến mọi người trong phòng (bao gồm cả người gửi để sync UI)
      io.to(room).emit("receive_message", newMessage);
    } catch (error) {
      console.error("❌ Socket error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔥 User disconnected");
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/address", deliveryAddressRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/vnpay", vnpayRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);

// Phục vụ file tĩnh trong thư mục uploads
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root endpoint
app.get("/", (req, res) => res.send("🍔 Foodify API is running..."));

const PORT = process.env.PORT || 1612;
httpServer.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));

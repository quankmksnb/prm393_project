# Foodify - Ứng dụng Đặt món ăn Đa nền tảng

Foodify là một hệ thống đặt món ăn hiện đại bao gồm:
1. **Backend**: Node.js & Express (MongoDB).
2. **Web Admin**: Next.js dành cho chủ quán (Seller).
3. **Mobile App**: Flutter dành cho khách hàng (Customer).

## 🚀 Tính năng nổi bật
- **Real-time Chat**: Trao đổi trực tiếp giữa khách hàng và chủ quán qua Socket.io.
- **Review System**: Đánh giá món ăn kèm số sao và nhận xét (Social Proof).
- **Dashboard & Analytics**: Thống kê doanh thu, đơn hàng, biểu đồ tăng trưởng cho chủ quán.
- **Order Management**: Quản lý trạng thái đơn hàng (Chờ xác nhận, Đang giao, Hoàn thành).
- **Payment**: Tích hợp thanh toán theo nhiều phương thức (COD, VNPay).

---

## 🛠 Hướng dẫn cài đặt

### 1. Backend (be/)
- Cài đặt dependency: `npm install`
- Cấu hình file `.env` (MongoDB URI, JWT Secret...)
- Chạy server: `node src/server.js` (hoặc `npm run dev`)
- Cổng mặc định: `1612`

### 2. Web Admin (web-admin/)
- Cài đặt dependency: `npm install`
- Chạy phát triển: `npm run dev`
- Truy cập tại: `http://localhost:3000`

### 3. Flutter App (Root folder)
- Cài đặt gói: `flutter pub get`
- Chạy ứng dụng: `flutter run`
- Lưu ý: Cấu hình `baseUrl` trong `lib/constants/api_constants.dart` khớp với IP/Localhost của Backend.

---

## 🔑 Tài khoản Test
Bạn có thể sử dụng các tài khoản sau để kiểm tra đầy đủ luồng tính năng:

### 👤 Khách hàng (User App)
- **Email**: `quan1@gmail.com`
- **Mật khẩu**: `123456`

### 🏪 Chủ quán (Seller Web)
- **Email**: `admin@gmail.com (Sử dụng đăng nhập trên Web Admin)
- **Mật khẩu**: `123456`
*(Tài khoản này đã được phân quyền 'seller' để truy cập Dashboard)*

---

## 📁 Cấu trúc thư mục
- `/be`: Mã nguồn Backend (API, Models, Middleware).
- `/web-admin`: Dashboard dành cho người bán (Next.js + Tailwind).
- `/lib`: Mã nguồn ứng dụng Flutter.
- `/l10n`: Đa ngôn ngữ (Vietnamese & English).
# Foodify - Flutter E-Commerce App

Ứng dụng Flutter hoàn chỉnh cho thương mại điện tử với giao diện đẹp, authentication, cart, checkout, và quản lý đơn hàng.

## ✨ Tính Năng

- ✅ **Splash Screen** - Kiểm tra trạng thái login tự động
- ✅ **Authentication** - Đăng ký, đăng nhập, xác thực OTP, quên mật khẩu
- ✅ **Danh sách sản phẩm** - Grid view với tìm kiếm
- ✅ **Chi tiết sản phẩm** - Xem chi tiết, số lượng động
- ✅ **Giỏ hàng** - Thêm, xóa, cập nhật số lượng
- ✅ **Thanh toán** - Chọn địa chỉ, phương thức thanh toán (COD/PayPal)
- ✅ **Lịch sử đơn hàng** - Xem tất cả đơn hàng, trạng thái, hủy đơn
- ✅ **Quản lý địa chỉ** - Thêm, sửa, xóa, đặt mặc định
- ✅ **Hồ sơ người dùng** - Xem thông tin, settings, logout
- ✅ **Giao diện** - Teal + Orange theme, Material 3 design

## 🛠 Công Nghệ

- **Frontend**: Flutter 3.x
- **State Management**: Provider
- **API**: REST API (Backend Node.js)
- **Storage**: SharedPreferences (token)
- **Networking**: HTTP

## 📱 Các Màn Hình

1. **Splash** → Tự động redirect dựa trên login status
2. **Login/Register/OTP** → Authentication flow
3. **Home** → Bottom nav: Shop / Orders / Profile
4. **Shop** → Danh sách sản phẩm (grid)
5. **Product Detail** → Chi tiết + thêm giỏ
6. **Cart** → Danh sách items + checkout
7. **Checkout** → Chọn địa chỉ + thanh toán
8. **Orders** → Lịch sử đơn hàng
9. **Addresses** → Quản lý địa chỉ
10. **Profile** → Thông tin user + logout

## 🚀 Cách Chạy

### 1. Backend (Node.js)

```bash
cd be
npm install
npm run dev
# Server chạy tại http://localhost:1612
```

**Lưu ý**: Đảm bảo MongoDB đang chạy

### 2. Frontend (Flutter)

```bash
# Cài dependencies
flutter pub get

# Chạy app
flutter run
```

**Lưu ý IP API**:

- **Android Emulator**: API sử dụng `10.0.2.2:1612` (mặc định)
- **Thiết bị thật**: Đổi URL trong `lib/constants/api_constants.dart` thành IP máy bạn (ví dụ: `192.168.x.y:1612`)

## 📁 Cấu Trúc Thư Mục

```
lib/
├── main.dart                    # App entry + Theme setup
├── constants/
│   └── api_constants.dart      # Base URL
├── models/
│   ├── user_model.dart         # User model
│   └── product_models.dart     # Product, Cart, Order, Address models
├── services/
│   ├── api_service.dart        # HTTP client
│   ├── auth_service.dart       # Auth API
│   ├── product_service.dart    # Product API
│   ├── cart_service.dart       # Cart API
│   ├── order_service.dart      # Order API
│   └── address_service.dart    # Address API
├── providers/
│   ├── auth_provider.dart      # Auth state
│   ├── product_provider.dart   # Product state
│   ├── cart_provider.dart      # Cart state
│   ├── order_provider.dart     # Order state
│   └── address_provider.dart   # Address state
├── screens/
│   ├── splash_screen.dart
│   ├── login_screen.dart
│   ├── register_screen.dart
│   ├── otp_screen.dart
│   ├── forgot_password_screen.dart
│   ├── home_screen.dart
│   ├── product_detail_screen.dart
│   ├── cart_screen.dart
│   ├── checkout_screen.dart
│   ├── order_history_screen.dart
│   ├── address_management_screen.dart
│   └── profile_screen.dart
└── widgets/
    └── loading_indicator.dart
```

## 🎨 Color Scheme

- **Primary**: Teal (`Colors.teal`) - Clean, fresh
- **Secondary**: Orange - Accent colors
- **Background**: Light colors for clarity

## ✅ Validation

- **Email**: Regex validation
- **Password**: Min 6 characters
- **Phone**: 9-11 digits
- **Address fields**: Required, non-empty
- **Form validation**: Real-time feedback

## 🔐 Security

- JWT token lưu trong `SharedPreferences`
- Automatic token refresh (nếu backend hỗ trợ)
- Password obscure toggle
- Logout clears token & user data

## 📝 Lưu Ý

1. **Token expiry**: Hiện tại không có auto-refresh, user cần login lại sau 7 ngày
2. **Payment**: Hiện tại chỉ hỗ trợ COD và PayPal (integration pending)
3. **Image loading**: Network images từ URL, có fallback icon
4. **Seller role**: Hỗ trợ trong backend, UI placeholder (có thể extend)

## 🐛 Troubleshooting

**"Connection refused"** → Backend không chạy

```bash
cd be && npm run dev
```

**"Cannot reach 10.0.2.2"** → Thiết bị thật, đổi IP trong `api_constants.dart`

**"CORS error"** → Backend cần enable CORS (đã cấu hình sẵn)

**"Token expired"** → Logout và login lại

## 📚 Tài Liệu API

Xem chi tiết API endpoints trong `be/src/routes/`

## 🎓 Học Thêm

- Flutter Provider: https://pub.dev/packages/provider
- REST API Best Practices: https://restfulapi.net/
- Dart Async/Await: https://dart.dev/codelabs/async-await

---

**Tác giả**: Flutter Developer  
**Ngày tạo**: March 2026  
**Phiên bản**: 1.0.0

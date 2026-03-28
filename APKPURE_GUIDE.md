# Hướng dẫn đưa ứng dụng Flutter lên APKPure

Tài liệu này hướng dẫn chi tiết các bước để chuẩn bị và đăng tải ứng dụng của bạn lên [APKPure Developer Console](https://developer.apkpure.com/).

## 1. Chuẩn bị Kỹ thuật (Trong dự án Flutter)

### Đổi Application ID (Package Name)
Mặc định dự án đang để là `com.example.prm393_project`. Bạn cần đổi nó thành một tên duy nhất để tránh xung đột.
- Mở file: `android/app/build.gradle.kts`
- Tìm dòng: `applicationId = "com.example.prm393_project"`
- Đổi thành: `applicationId = "com.yourname.prm393project"` (Ví dụ: `com.quankm.foodorder`)

### Tạo KeyStore (Để ký ứng dụng)
Nếu bạn chưa có Keystore, hãy tạo bằng lệnh sau trong thư mục `android/app`:
```powershell
keytool -genkey -v -keystore release-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias release
```
*Lưu ý: Nhớ mật khẩu bạn đã đặt.*

### Cấu hình Signing trong build.gradle.kts
Cập nhật phần `signingConfigs` và `buildTypes` trong `android/app/build.gradle.kts` để sử dụng file keystore vừa tạo.

### Build tệp APK
Chạy lệnh sau trong terminal của dự án:
```powershell
flutter build apk --release
```
Tệp sau khi build sẽ nằm tại: `build\app\outputs\flutter-apk\app-release.apk`.

---

## 2. Đăng ký tài khoản APKPure Developer

1. Truy cập [APKPure Developer Console](https://developer.apkpure.com/).
2. Đăng ký tài khoản (miễn phí) bằng Email hoặc tài khoản Google/Facebook.
3. Hoàn tất xác minh email (nếu có).

---

## 3. Đăng tải ứng dụng

### Bước 1: Thêm ứng dụng mới
- Chọn **"ADD APPLICATION"** trong bảng điều khiển.
- Nhập **App Package Name** (phải khớp với `applicationId` bạn đã đổi ở trên).

### Bước 2: Nhập thông tin chi tiết
Cung cấp các thông tin sau:
- **App Name**: Tên ứng dụng hiển thị trên cửa hàng.
- **Category**: Chọn loại ứng dụng (ví dụ: Food & Drink, Shopping).
- **Short & Long Description**: Mô tả ngắn và chi tiết về tính năng.
- **Privacy Policy URL**: Đường dẫn đến chính sách bảo mật (có thể dùng trang web đơn giản hoặc Github Gist).

### Bước 3: Đồ họa (Graphic Assets)
- **Icon**: Kích thước **512x512** (định dạng PNG/JPG).
- **Screenshots**: Ít nhất 2-3 ảnh chụp màn hình ứng dụng (thường là 480x800 hoặc 720x1280).
- **Feature Graphic**: Ảnh biểu ngữ (1024x500).

### Bước 4: Tải lên APK
- Vào mục **"MANAGE VERSIONS"**.
- Nhấn **"SELECT FILES"** và chọn tệp `app-release.apk` bạn đã build.
- Nhập thông tin "What's new" (ví dụ: "Initial release").

### Bước 5: Gửi kiểm duyệt
- Nhấn **"Submit for Review"**.
- APKPure sẽ kiểm tra virus và tính hợp lệ. Quá trình này thường mất từ 1-3 ngày làm việc.

---

## 4. Một số lưu ý quan trọng
- **Bảo mật**: Tuyệt đối không chia sẻ file `.jks` và mật khẩu keystore.
- **Kích thước**: APKPure hỗ trợ tệp lên đến 2GB.
- **Quyền sở hữu**: Nếu ứng dụng của bạn đã có trên Google Play, bạn có thể dùng tính năng "Claim" để xác nhận quyền sở hữu nhanh hơn.

Chúc bạn thành công!

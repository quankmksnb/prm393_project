class ApiConstants {
  // NOTE: When running on Android emulator, use 10.0.2.2 to reach host machine.
  // If you run on a physical device, replace this with your PC/Laptop local IP (e.g., 192.168.1.xxx).
  static const baseUrl = 'http://10.0.2.2:1612/api';

  // Timeout for HTTP requests.
  static const timeoutSeconds = 15;

  // Xử lý hiển thị ảnh Localhost cho máy ảo Android.
  static String getImageUrl(String url) {
    if (url.isEmpty) return '';
    if (url.startsWith('http://localhost:1612')) {
      return url.replaceFirst('http://localhost:1612', 'http://10.0.2.2:1612');
    }
    return url;
  }
}

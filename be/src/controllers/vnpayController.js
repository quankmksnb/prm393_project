import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment';
import Order from '../models/Order.js';

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// API: Tạo đường dẫn VNPay
export const createPaymentUrl = async (req, res) => {
  try {
    const { orderId, amount, bankCode } = req.body;
    
    let ipAddr = req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "127.0.0.1";

    let tmnCode = process.env.VNP_TMN_CODE;
    let secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    let returnUrl = process.env.VNP_RETURN_URL;

    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    let expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD: ' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_ExpireDate'] = expireDate;
    if (bankCode !== null && bankCode !== '' && bankCode !== undefined) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    // Ký dữ liệu URL với HMAC SHA512
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    res.status(200).json({ paymentUrl: vnpUrl });
  } catch (error) {
    console.error("Lỗi tạo URL VNPay:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// API: Flutter App gửi kết quả URL trả về để xác thực và đổi trạng thái đơn
export const verifyReturnUrl = async (req, res) => {
  try {
    let vnp_Params = req.body; // Gửi toàn bộ query param của URL về đây
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = process.env.VNP_HASH_SECRET;
    
    // Tạo lại chữ ký
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
      // Mã 00 là giao dịch thành công
      if (vnp_Params['vnp_ResponseCode'] == '00') {
        const orderId = vnp_Params['vnp_TxnRef'];
        
        // Cập nhật trạng thái đơn hàng thành 'confirmed' (Đã thanh toán / Xác nhận)
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId, 
          { status: 'confirmed', paymentMethod: 'VNPay' }, 
          { new: true }
        );
        
        return res.status(200).json({ success: true, message: "Thanh toán thành công!", order: updatedOrder });
      } else {
        return res.status(400).json({ success: false, message: "Giao dịch không thành công" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Chữ ký không hợp lệ (Invalid Signature)" });
    }
  } catch (error) {
    console.error("Lỗi xác thực VNPay:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

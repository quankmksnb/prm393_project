import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect, sellerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Cảnh báo: Chỉ cho phép upload hình ảnh (jpg, jpeg, png, webp)!");
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post("/", protect, sellerOnly, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không tìm thấy file tải lên" });
  }
  
  // Xây dựng đường dẫn URL tĩnh để Frontend truy cập ảnh
  const port = process.env.PORT || 1612;
  const filename = req.file.filename;
  const imageUrl = `http://localhost:${port}/uploads/${filename}`;
  
  res.status(200).json({
    message: "Tải ảnh lên thành công",
    imageUrl,
  });
});

export default router;

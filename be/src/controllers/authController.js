// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendEmailOtp } from "../utils/emailService.js";
import crypto from "crypto";

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashed,
      role: role || "user",
      status: "pending"
    });

    // invalidate OTP cũ (nếu có)
    await OTP.deleteMany({ email, used: false });

    const otp = generateOtp(6);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    await OTP.create({ email, otp, expiresAt });

    await sendEmailOtp({ to: email, otp });

    res.status(201).json({
      message: "Registered. OTP sent to email.",
      user: { id: user._id, email: user.email, status: user.status }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OTP.findOne({ email, otp, used: false });
    if (!record) return res.status(400).json({ message: "Invalid OTP" });

    if (record.expiresAt < new Date())
      return res.status(400).json({ message: "OTP expired" });

    // mark used
    record.used = true;
    await record.save();

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { status: "active" } },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Email verified", status: user.status });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.status === "active")
      return res.status(400).json({ message: "Account already verified" });

    // rate-limit: nếu còn OTP chưa hết hạn trong 30s gần nhất thì từ chối
    const recent = await OTP.findOne({
      email,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ expiresAt: -1 });

    if (recent) {
      const secondsLeft = Math.max(0, Math.ceil((recent.expiresAt - Date.now()) / 1000));
      if (secondsLeft > 90) {
        return res.status(429).json({ message: "Please wait before requesting a new OTP" });
      }
    }

    await OTP.deleteMany({ email, used: false });

    const otp = generateOtp(6);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    await OTP.create({ email, otp, expiresAt });

    await sendEmailOtp({ to: email, otp });

    res.json({ message: "New OTP sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.status !== "active")
      return res.status(403).json({ message: "Account not verified or blocked" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Không cần lưu token hay xóa gì cả
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found with this email" });

    // 🔸 Random password (8 ký tự ngẫu nhiên)
    const newPassword = crypto.randomBytes(4).toString("hex"); // ví dụ: "a9f4b3c2"

    // 🔸 Hash & update ngay trong DB
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // 🔸 Gửi mail password mới
    await sendEmailOtp({
      to: email,
      otp: `
        <div style="font-family:Inter,Arial,sans-serif; line-height:1.6">
          <h2>Foodify – Mật khẩu mới của bạn</h2>
          <p>Hệ thống đã tạo lại mật khẩu mới cho tài khoản:</p>
          <p><b>${email}</b></p>
          <div style="font-size:22px; font-weight:700; letter-spacing:2px; color:#f97316">
            ${newPassword}
          </div>
          <p>Hãy đăng nhập lại bằng mật khẩu trên và đổi lại trong phần hồ sơ cá nhân.</p>
          <br/>
          <p style="color:#6b7280">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        </div>
      `,
    });

    res.status(200).json({ message: "New password sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
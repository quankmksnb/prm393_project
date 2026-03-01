// src/models/OTP.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  // TTL: document sẽ bị xóa sau khi qua expiresAt (expires: 0 nghĩa là at time)
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  used: { type: Boolean, default: false }
});

export default mongoose.model("OTP", otpSchema);

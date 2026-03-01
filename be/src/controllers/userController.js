import User from "../models/User.js";
import bcrypt from "bcryptjs";

// 🟢 Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Update profile (name, phone, avatar)
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, avatar },
      { new: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Profile updated successfully", user: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

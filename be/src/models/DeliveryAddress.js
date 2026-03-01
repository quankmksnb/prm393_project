import mongoose from "mongoose";

const deliveryAddressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fullName: String,
  phone: String,
  addressLine: String,
  city: String,
  district: String,
  ward: String,
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("DeliveryAddress", deliveryAddressSchema);

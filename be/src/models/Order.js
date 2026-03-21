import mongoose from "mongoose";
const { Schema } = mongoose;

const orderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    deliveryAddress: { type: Schema.Types.ObjectId, ref: "DeliveryAddress" },
    paymentMethod: {
      type: String,
      enum: ["COD", "PayPal", "VNPay"],
      default: "COD",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivering", "completed", "cancelled"],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

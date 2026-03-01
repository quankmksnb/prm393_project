import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  method: { type: String, enum: ["COD", "PayPal"] },
  status: { type: String, enum: ["unpaid", "paid", "failed"], default: "unpaid" },
  transactionId: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", paymentSchema);

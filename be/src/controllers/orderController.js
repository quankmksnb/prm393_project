import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import DeliveryAddress from "../models/DeliveryAddress.js";

// 🟢 Checkout
export const checkout = async (req, res) => {
  try {
    const { addressId, paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const address = await DeliveryAddress.findById(addressId);
    if (!address) return res.status(404).json({ message: "Invalid address" });

    // Tính tổng tiền + snapshot sản phẩm
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      const lineTotal = product.price * item.quantity;
      totalAmount += lineTotal;

      // Giảm stock
      if (product.stock < item.quantity)
        return res
          .status(400)
          .json({ message: `Not enough stock for ${product.name}` });
      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      });
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      deliveryAddress: addressId,
      paymentMethod,
      status: "pending",
    });

    // Clear cart sau khi checkout
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("deliveryAddress");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Get order detail
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("deliveryAddress");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 (Seller) Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // ✅ 1. Danh sách trạng thái hợp lệ
    const allowedStatuses = ["pending", "confirmed", "delivering", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // ✅ 2. Lấy đơn hàng hiện tại ra kiểm tra
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Không cho phép đổi trạng thái nếu đơn đã huỷ hoặc đã hoàn thành
    if (order.status === "cancelled" || order.status === "completed") {
      return res.status(400).json({ 
        message: `Cannot change status of a ${order.status} order` 
      });
    }

    // ✅ 3. Cập nhật đơn hàng
    order.status = status;
    await order.save();
    
    // Populate để trả về kết quả chuẩn
    await order.populate("user", "name email");

    // ✅ 3. Trả về dữ liệu
    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("🧨 Update order status error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// 🟠 Cancel order (user)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: req.user.id });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.status !== "pending")
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });

    order.status = "cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

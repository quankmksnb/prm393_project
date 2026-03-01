import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// 🟢 Get user's cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({ product: productId, quantity: quantity || 1 });
    }

    // Tính lại tổng tiền
    let total = 0;
    for (const item of cart.items) {
      const p = await Product.findById(item.product);
      total += p.price * item.quantity;
    }
    cart.totalPrice = total;
    cart.updatedAt = new Date();

    await cart.save();
    const populatedCart = await cart.populate("items.product");
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Update quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );
    if (!item) return res.status(404).json({ message: "Product not in cart" });

    item.quantity = quantity;

    // Recalculate total
    let total = 0;
    for (const it of cart.items) {
      const p = await Product.findById(it.product);
      total += p.price * it.quantity;
    }
    cart.totalPrice = total;

    await cart.save();
    const populated = await cart.populate("items.product");
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    // Recalculate total
    let total = 0;
    for (const item of cart.items) {
      const p = await Product.findById(item.product);
      total += p.price * item.quantity;
    }
    cart.totalPrice = total;

    await cart.save();
    const populated = await cart.populate("items.product");
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

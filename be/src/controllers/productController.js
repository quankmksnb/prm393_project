// src/controllers/productController.js
import Product from "../models/Product.js";
import Category from "../models/Category.js";

// GET all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("seller", "name email");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET one product by id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("seller", "name email");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST create product (seller only)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    const foundCategory = await Category.findById(category);
    if (!foundCategory)
      return res.status(400).json({ message: "Invalid category ID" });

    const product = await Product.create({
      name,
      description,
      price,
      image,
      category,
      stock,
      seller: req.user.id,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT update product (seller only, must own)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user.id)
      return res
        .status(403)
        .json({ message: "You are not allowed to edit this product" });

    const { name, description, price, image, category, stock } = req.body;
    if (category) {
      const cat = await Category.findById(category);
      if (!cat)
        return res.status(400).json({ message: "Invalid category ID" });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, image, category, stock },
      { new: true }
    );

    res.status(200).json({ message: "Product updated", product: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE product (seller only, must own)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user.id)
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this product" });

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

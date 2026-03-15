import 'package:flutter/material.dart';

import '../models/product_models.dart';
import '../services/product_service.dart';

class ProductProvider extends ChangeNotifier {
  final ProductService _productService;

  ProductProvider({ProductService? productService})
    : _productService = productService ?? ProductService();

  List<ProductModel> _products = [];
  List<ProductModel> get products => _products;

  List<CategoryModel> _categories = [];
  List<CategoryModel> get categories => _categories;

  ProductModel? _selectedProduct;
  ProductModel? get selectedProduct => _selectedProduct;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  Future<void> fetchProducts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _products = await _productService.getProducts();
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchCategories() async {
    try {
      _categories = await _productService.getCategories();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> fetchProductById(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _selectedProduct = await _productService.getProductById(id);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }
}

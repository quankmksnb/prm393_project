import 'package:flutter/material.dart';

import '../models/product_models.dart';
import '../services/cart_service.dart';

class CartProvider extends ChangeNotifier {
  final CartService _cartService;

  CartProvider({CartService? cartService})
    : _cartService = cartService ?? CartService();

  CartModel? _cart;
  CartModel? get cart => _cart;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  Future<void> fetchCart(String token) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _cart = await _cartService.getCart(token);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> addToCart({
    required String token,
    required String productId,
    int quantity = 1,
  }) async {
    _error = null;

    try {
      await _cartService.addToCart(token, productId, quantity);
      await fetchCart(token);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> updateCartItem({
    required String token,
    required String productId,
    required int quantity,
  }) async {
    _error = null;

    try {
      await _cartService.updateCartItem(token, productId, quantity);
      await fetchCart(token);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> removeFromCart({
    required String token,
    required String productId,
  }) async {
    _error = null;

    try {
      await _cartService.removeFromCart(token, productId);
      await fetchCart(token);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  double get totalPrice => _cart?.totalPrice ?? 0.0;
  int get itemCount => _cart?.items.length ?? 0;
}

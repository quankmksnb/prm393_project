import 'package:flutter/material.dart';

import '../models/product_models.dart';
import '../services/order_service.dart';

class OrderProvider extends ChangeNotifier {
  final OrderService _orderService;

  OrderProvider({OrderService? orderService})
    : _orderService = orderService ?? OrderService();

  List<OrderModel> _orders = [];
  List<OrderModel> get orders => _orders;

  OrderModel? _selectedOrder;
  OrderModel? get selectedOrder => _selectedOrder;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  Future<Map<String, dynamic>> checkout({
    required String token,
    required String addressId,
    required String paymentMethod,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _orderService.checkout(
        token: token,
        addressId: addressId,
        paymentMethod: paymentMethod,
      );
      _isLoading = false;
      notifyListeners();
      return result;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> fetchUserOrders(String token) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _orders = await _orderService.getUserOrders(token);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchOrderById(String token, String orderId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _selectedOrder = await _orderService.getOrderById(token, orderId);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> cancelOrder(String token, String orderId) async {
    _error = null;

    try {
      await _orderService.cancelOrder(token, orderId);
      await fetchUserOrders(token);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }
}

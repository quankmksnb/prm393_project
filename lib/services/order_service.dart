import 'dart:convert';

import 'package:http/http.dart' as http;

import '../constants/api_constants.dart';
import '../models/product_models.dart';

class OrderService {
  final String baseUrl;

  OrderService({String? baseUrl}) : baseUrl = baseUrl ?? ApiConstants.baseUrl;

  Future<Map<String, dynamic>> checkout({
    required String token,
    required String addressId,
    required String paymentMethod,
  }) async {
    final uri = Uri.parse('$baseUrl/orders/checkout');
    final response = await http
        .post(
          uri,
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({
            'deliveryAddress': addressId,
            'paymentMethod': paymentMethod,
          }),
        )
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }

    throw _parseError(response);
  }

  Future<List<OrderModel>> getUserOrders(String token) async {
    final uri = Uri.parse('$baseUrl/orders');
    final response = await http
        .get(uri, headers: {'Authorization': 'Bearer $token'})
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      final data = (json['data'] ?? json) as List? ?? [];
      return data
          .map((item) => OrderModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    throw _parseError(response);
  }

  Future<OrderModel> getOrderById(String token, String orderId) async {
    final uri = Uri.parse('$baseUrl/orders/$orderId');
    final response = await http
        .get(uri, headers: {'Authorization': 'Bearer $token'})
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      final data = json['data'] ?? json;
      return OrderModel.fromJson(data as Map<String, dynamic>);
    }

    throw _parseError(response);
  }

  Future<void> cancelOrder(String token, String orderId) async {
    final uri = Uri.parse('$baseUrl/orders/$orderId/cancel');
    final response = await http
        .put(uri, headers: {'Authorization': 'Bearer $token'})
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode != 200) {
      throw _parseError(response);
    }
  }

  Exception _parseError(http.Response response) {
    try {
      final json = jsonDecode(response.body);
      if (json is Map<String, dynamic> && json['message'] != null) {
        return Exception(json['message']);
      }
    } catch (_) {
      // ignore
    }
    return Exception('Error: ${response.statusCode}');
  }
}

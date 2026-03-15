import 'dart:convert';

import 'package:http/http.dart' as http;

import '../constants/api_constants.dart';
import '../models/product_models.dart';

class CartService {
  final String baseUrl;

  CartService({String? baseUrl}) : baseUrl = baseUrl ?? ApiConstants.baseUrl;

  Future<CartModel> getCart(String token) async {
    final uri = Uri.parse('$baseUrl/cart');
    final response = await http
        .get(uri, headers: {'Authorization': 'Bearer $token'})
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      final data = json['data'] ?? json;
      return CartModel.fromJson(data as Map<String, dynamic>);
    }

    throw _parseError(response);
  }

  Future<void> addToCart(String token, String productId, int quantity) async {
    final uri = Uri.parse('$baseUrl/cart/add');
    final response = await http
        .post(
          uri,
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({'productId': productId, 'quantity': quantity}),
        )
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw _parseError(response);
    }
  }

  Future<void> updateCartItem(
    String token,
    String productId,
    int quantity,
  ) async {
    final uri = Uri.parse('$baseUrl/cart/update');
    final response = await http
        .put(
          uri,
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({'productId': productId, 'quantity': quantity}),
        )
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode != 200) {
      throw _parseError(response);
    }
  }

  Future<void> removeFromCart(String token, String productId) async {
    final uri = Uri.parse('$baseUrl/cart/remove/$productId');
    final response = await http
        .delete(uri, headers: {'Authorization': 'Bearer $token'})
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

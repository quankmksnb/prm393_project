import 'dart:convert';

import 'package:http/http.dart' as http;

import '../constants/api_constants.dart';
import '../models/product_models.dart';

class AddressService {
  final String baseUrl;

  AddressService({String? baseUrl}) : baseUrl = baseUrl ?? ApiConstants.baseUrl;

  Future<List<DeliveryAddressModel>> getMyAddresses(String token) async {
    final uri = Uri.parse('$baseUrl/address');
    final response = await http
        .get(uri, headers: {'Authorization': 'Bearer $token'})
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      final data = (json['data'] ?? json) as List? ?? [];
      return data
          .map(
            (item) =>
                DeliveryAddressModel.fromJson(item as Map<String, dynamic>),
          )
          .toList();
    }

    throw _parseError(response);
  }

  Future<DeliveryAddressModel?> getDefaultAddress(String token) async {
    final uri = Uri.parse('$baseUrl/address/default');
    final response = await http
        .get(uri, headers: {'Authorization': 'Bearer $token'})
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      final data = json['data'];
      if (data != null) {
        return DeliveryAddressModel.fromJson(data as Map<String, dynamic>);
      }
    }

    return null;
  }

  Future<DeliveryAddressModel> addAddress({
    required String token,
    required DeliveryAddressModel address,
  }) async {
    final uri = Uri.parse('$baseUrl/address');
    final response = await http
        .post(
          uri,
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode(address.toJson()),
        )
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode == 200 || response.statusCode == 201) {
      final json = jsonDecode(response.body);
      final data = json['data'] ?? json;
      return DeliveryAddressModel.fromJson(data as Map<String, dynamic>);
    }

    throw _parseError(response);
  }

  Future<void> updateAddress({
    required String token,
    required String addressId,
    required DeliveryAddressModel address,
  }) async {
    final uri = Uri.parse('$baseUrl/address/$addressId');
    final response = await http
        .put(
          uri,
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode(address.toJson()),
        )
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode != 200) {
      throw _parseError(response);
    }
  }

  Future<void> deleteAddress({
    required String token,
    required String addressId,
  }) async {
    final uri = Uri.parse('$baseUrl/address/$addressId');
    final response = await http
        .delete(uri, headers: {'Authorization': 'Bearer $token'})
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode != 200) {
      throw _parseError(response);
    }
  }

  Future<void> setDefaultAddress({
    required String token,
    required String addressId,
  }) async {
    final uri = Uri.parse('$baseUrl/address/$addressId/default');
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

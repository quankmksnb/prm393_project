import 'dart:convert';

import 'package:http/http.dart' as http;

import '../constants/api_constants.dart';
import '../models/product_models.dart';

class ProductService {
  final String baseUrl;

  ProductService({String? baseUrl}) : baseUrl = baseUrl ?? ApiConstants.baseUrl;

  Future<List<ProductModel>> getProducts() async {
    final uri = Uri.parse('$baseUrl/products');
    final response = await http
        .get(uri)
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);

      List rawList = [];

      if (decoded is List) {
        rawList = decoded;
      } else if (decoded is Map<String, dynamic>) {
        // common wrappers
        if (decoded['data'] is List) {
          rawList = decoded['data'] as List;
        } else if (decoded['products'] is List) {
          rawList = decoded['products'] as List;
        } else if (decoded['items'] is List) {
          rawList = decoded['items'] as List;
        } else {
          // try to find the first list value
          final firstList = decoded.values.firstWhere(
            (v) => v is List,
            orElse: () => null,
          );
          if (firstList is List) {
            rawList = firstList;
          } else {
            // as a fallback, if map's values are product maps keyed by id, take values
            rawList = decoded.values.toList();
          }
        }
      } else {
        throw Exception('Unexpected response format');
      }

      return rawList.map((item) {
        if (item is Map<String, dynamic>) return ProductModel.fromJson(item);
        if (item is String) {
          // sometimes API returns list of ids or names - create minimal model
          return ProductModel(
            id: item,
            name: item,
            description: '',
            price: 0.0,
            image: '',
            categoryId: '',
            stock: 0,
            sellerId: '',
          );
        }
        return ProductModel.fromJson(Map<String, dynamic>.from(item as Map));
      }).toList();
    }

    throw _parseError(response);
  }

  Future<ProductModel> getProductById(String id) async {
    final uri = Uri.parse('$baseUrl/products/$id');
    final response = await http
        .get(uri)
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      // json may be a Map or a List (or wrapped). Handle safely.
      if (json is Map<String, dynamic>) {
        final data = (json['data'] is Map<String, dynamic>)
            ? json['data'] as Map<String, dynamic>
            : json;
        return ProductModel.fromJson(data as Map<String, dynamic>);
      }
      if (json is List && json.isNotEmpty) {
        final first = json.first;
        if (first is Map<String, dynamic>) return ProductModel.fromJson(first);
      }
      throw Exception('Unexpected product response');
    }

    throw _parseError(response);
  }

  Future<List<CategoryModel>> getCategories() async {
    final uri = Uri.parse('$baseUrl/categories');
    final response = await http
        .get(uri)
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      dynamic dataRaw;
      if (json is Map<String, dynamic>) {
        dataRaw = json['data'] ?? json['categories'] ?? json;
      } else if (json is List) {
        dataRaw = json;
      } else {
        dataRaw = [];
      }

      final dataList = dataRaw is List
          ? dataRaw
          : (dataRaw is Map ? dataRaw.values.toList() : <dynamic>[]);
      return dataList
          .map((item) => CategoryModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    throw _parseError(response);
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

import 'dart:convert';

import 'package:http/http.dart' as http;

import '../constants/api_constants.dart';

class ApiService {
  final String baseUrl;

  ApiService({String? baseUrl}) : baseUrl = baseUrl ?? ApiConstants.baseUrl;

  Future<http.Response> get(String path, {Map<String, String>? headers}) async {
    final uri = Uri.parse('$baseUrl$path');
    return http
        .get(uri, headers: headers)
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));
  }

  Future<http.Response> post(
    String path, {
    Map<String, String>? headers,
    Object? body,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    return http
        .post(uri, headers: {..._defaultHeaders(), ...?headers}, body: body)
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));
  }

  Future<http.Response> put(
    String path, {
    Map<String, String>? headers,
    Object? body,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    return http
        .put(uri, headers: {..._defaultHeaders(), ...?headers}, body: body)
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));
  }

  Future<http.Response> delete(
    String path, {
    Map<String, String>? headers,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    return http
        .delete(uri, headers: headers)
        .timeout(const Duration(seconds: ApiConstants.timeoutSeconds));
  }

  Map<String, String> _defaultHeaders() {
    return {'Content-Type': 'application/json'};
  }

  static String? extractMessageFromResponse(http.Response response) {
    try {
      final json = jsonDecode(response.body);
      if (json is Map<String, dynamic> && json['message'] != null) {
        return json['message'].toString();
      }
    } catch (_) {
      // ignore
    }
    return null;
  }
}

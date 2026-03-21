import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_model.dart';
import 'api_service.dart';

class AuthService {
  static const _tokenKey = 'auth_token';
  static const _userKey = 'auth_user';

  final ApiService _apiService;

  AuthService({ApiService? apiService})
    : _apiService = apiService ?? ApiService();

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<UserModel?> getSavedUser() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_userKey);
    if (raw == null) return null;
    final json = jsonDecode(raw) as Map<String, dynamic>;
    return UserModel.fromJson(json);
  }

  Future<void> saveAuth({
    required String token,
    required UserModel user,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  Future<void> clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiService.post(
      '/auth/login',
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return data;
    }

    throw _parseError(response);
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await _apiService.post(
      '/auth/register',
      body: jsonEncode({'name': name, 'email': email, 'password': password}),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return data;
    }

    throw _parseError(response);
  }

  Future<Map<String, dynamic>> verifyOtp({
    required String email,
    required String otp,
  }) async {
    final response = await _apiService.post(
      '/auth/verify-otp',
      body: jsonEncode({'email': email, 'otp': otp}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }

    throw _parseError(response);
  }

  Future<void> logout() async {
    await clearAuth();
  }

  Future<UserModel> updateProfile({
    required String token,
    String? name,
    String? phone,
    String? avatar,
  }) async {
    final response = await _apiService.put(
      '/users/update',
      headers: {'Authorization': 'Bearer $token'},
      body: jsonEncode({
        if (name != null) 'name': name,
        if (phone != null) 'phone': phone,
        if (avatar != null) 'avatar': avatar,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final updatedUser = UserModel.fromJson(data['user']);
      
      // Update saved user in SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_userKey, jsonEncode(updatedUser.toJson()));
      
      return updatedUser;
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
    return Exception('Server error: ${response.statusCode}');
  }
}

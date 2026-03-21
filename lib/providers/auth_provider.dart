import 'package:flutter/material.dart';

import '../models/user_model.dart';
import '../services/auth_service.dart';

enum AuthStatus { uninitialized, authenticated, unauthenticated, loading }

class AuthProvider extends ChangeNotifier {
  final AuthService _authService;

  AuthProvider({AuthService? authService})
    : _authService = authService ?? AuthService();

  AuthStatus _status = AuthStatus.uninitialized;
  AuthStatus get status => _status;

  UserModel? _user;
  UserModel? get user => _user;

  String? _token;
  String? get token => _token;

  String? _error;
  String? get error => _error;

  Future<void> init() async {
    _status = AuthStatus.loading;
    notifyListeners();

    try {
      final token = await _authService.getToken();
      final savedUser = await _authService.getSavedUser();

      if (token != null && savedUser != null) {
        _token = token;
        _user = savedUser;
        _status = AuthStatus.authenticated;
      } else {
        _status = AuthStatus.unauthenticated;
      }
    } catch (_) {
      _status = AuthStatus.unauthenticated;
    }

    notifyListeners();
  }

  Future<void> login({required String email, required String password}) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();

    try {
      final data = await _authService.login(email: email, password: password);
      final token = data['token'] as String?;
      final userJson = data['user'] as Map<String, dynamic>?;

      if (token == null || userJson == null) {
        throw Exception('Invalid server response');
      }

      final user = UserModel.fromJson(userJson);
      await _authService.saveAuth(token: token, user: user);

      _token = token;
      _user = user;
      _status = AuthStatus.authenticated;
    } catch (e) {
      _error = e.toString();
      _status = AuthStatus.unauthenticated;
    }

    notifyListeners();
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();

    try {
      final data = await _authService.register(
        name: name,
        email: email,
        password: password,
      );
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return data;
    } catch (e) {
      _error = e.toString();
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      rethrow;
    }
  }

  Future<Map<String, dynamic>> verifyOtp({
    required String email,
    required String otp,
  }) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();

    try {
      final data = await _authService.verifyOtp(email: email, otp: otp);
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return data;
    } catch (e) {
      _error = e.toString();
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> logout() async {
    _status = AuthStatus.loading;
    notifyListeners();

    await _authService.logout();
    _token = null;
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  Future<void> updateProfile({
    String? name,
    String? phone,
    String? avatar,
  }) async {
    if (_token == null) return;

    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();

    try {
      final updatedUser = await _authService.updateProfile(
        token: _token!,
        name: name,
        phone: phone,
        avatar: avatar,
      );
      _user = updatedUser;
      _status = AuthStatus.authenticated;
    } catch (e) {
      _error = e.toString();
      _status = AuthStatus.authenticated; // Keep authenticated even if update fails
    }

    notifyListeners();
  }
}

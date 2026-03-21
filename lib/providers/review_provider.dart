import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../models/review_model.dart';
import '../constants/api_constants.dart';
import '../services/auth_service.dart';

class ReviewProvider with ChangeNotifier {
  List<ReviewModel> _productReviews = [];
  bool _isLoading = false;
  String? _error;

  List<ReviewModel> get productReviews => _productReviews;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchProductReviews(String productId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/reviews/product/$productId'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        _productReviews = data.map((item) => ReviewModel.fromJson(item)).toList();
      } else {
        _error = 'Không thể tải đánh giá';
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addReview({
    required String productId,
    required int rating,
    required String comment,
  }) async {
    try {
      final token = await AuthService().getToken();
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/reviews'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'productId': productId,
          'rating': rating,
          'comment': comment,
        }),
      );

      if (response.statusCode == 201) {
        final newReview = ReviewModel.fromJson(json.decode(response.body));
        _productReviews.insert(0, newReview);
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      print('Add review error: $e');
      return false;
    }
  }
}

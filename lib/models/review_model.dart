class ReviewModel {
  final String id;
  final String userId;
  final String userName;
  final String? userAvatar;
  final String productId;
  final int rating;
  final String comment;
  final DateTime createdAt;

  ReviewModel({
    required this.id,
    required this.userId,
    required this.userName,
    this.userAvatar,
    required this.productId,
    required this.rating,
    required this.comment,
    required this.createdAt,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] ?? {};
    return ReviewModel(
      id: json['_id'] ?? '',
      userId: user['_id'] ?? '',
      userName: user['name'] ?? 'Ẩn danh',
      userAvatar: user['avatar'],
      productId: json['product'] ?? '',
      rating: json['rating'] ?? 5,
      comment: json['comment'] ?? '',
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

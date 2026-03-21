class CategoryModel {
  final String id;
  final String name;

  CategoryModel({required this.id, required this.name});

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(id: json['_id'] ?? '', name: json['name'] ?? '');
  }
}

class ProductModel {
  final String id;
  final String name;
  final String description;
  final double price;
  final String image;
  final String categoryId;
  final int stock;
  final String sellerId;

  ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.image,
    required this.categoryId,
    required this.stock,
    required this.sellerId,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      image: _parseImageField(json['image']),
      categoryId: _parseIdField(json['category']),
      stock: (json['stock'] is int)
          ? json['stock'] as int
          : int.tryParse('${json['stock']}') ?? 0,
      sellerId: _parseIdField(json['seller']),
    );
  }

  static String _parseImageField(dynamic src) {
    if (src == null) return '';
    if (src is String) return src;
    if (src is Map) {
      // common keys
      final candidate =
          src['url'] ?? src['src'] ?? src['path'] ?? src['filename'] ?? '';
      if (candidate is String) return candidate;
      return candidate?.toString() ?? '';
    }
    if (src is List && src.isNotEmpty) {
      final first = src.first;
      if (first is String) return first;
      if (first is Map) {
        final candidate = first['url'] ?? first['src'] ?? first['path'] ?? '';
        if (candidate is String) return candidate;
        return candidate?.toString() ?? '';
      }
    }
    return '';
  }

  static String _parseIdField(dynamic v) {
    if (v == null) return '';
    if (v is String) return v;
    if (v is Map) {
      final candidate = v['_id'] ?? v['id'] ?? '';
      if (candidate is String) return candidate;
      return candidate?.toString() ?? '';
    }
    return v.toString();
  }
}

class CartItemModel {
  final String productId;
  final String productName;
  final double price;
  final String image;
  int quantity;

  CartItemModel({
    required this.productId,
    required this.productName,
    required this.price,
    required this.image,
    required this.quantity,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    // `product` may be populated (object) or just an id string depending on backend.
    final prod = json['product'] ?? json['productId'];
    String productId = '';
    String productName = json['productName'] ?? '';
    double price = (json['price'] as num?)?.toDouble() ?? 0.0;
    String image = json['image'] ?? '';

    if (prod is String) {
      productId = prod;
    } else if (prod is Map<String, dynamic>) {
      productId = (prod['_id'] ?? prod['id'] ?? '').toString();
      productName = productName.isNotEmpty
          ? productName
          : (prod['name'] ?? '') as String;
      price = (prod['price'] as num?)?.toDouble() ?? price;
      image = ProductModel._parseImageField(prod['image']);
    }

    return CartItemModel(
      productId: productId,
      productName: productName,
      price: price,
      image: image,
      quantity: json['quantity'] ?? 1,
    );
  }

  Map<String, dynamic> toJson() => {'product': productId, 'quantity': quantity};

  double get subtotal => price * quantity;
}

class CartModel {
  final List<CartItemModel> items;
  final double totalPrice;

  CartModel({required this.items, required this.totalPrice});

  factory CartModel.fromJson(Map<String, dynamic> json) {
    final itemsList =
        (json['items'] as List?)
            ?.map((e) => CartItemModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    return CartModel(
      items: itemsList,
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class OrderItemModel {
  final String productId;
  final String productName;
  final String image;
  final double price;
  final int quantity;

  OrderItemModel({
    required this.productId,
    required this.productName,
    required this.image,
    required this.price,
    required this.quantity,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      productId: json['productId'] ?? '',
      productName: json['productName'] ?? '',
      image: json['image'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      quantity: json['quantity'] ?? 1,
    );
  }
}

class OrderModel {
  final String id;
  final List<OrderItemModel> items;
  final double totalAmount;
  final String status;
  final String paymentMethod;
  final DateTime? createdAt;
  final DeliveryAddressModel? deliveryAddress;

  OrderModel({
    required this.id,
    required this.items,
    required this.totalAmount,
    required this.status,
    required this.paymentMethod,
    this.createdAt,
    this.deliveryAddress,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final itemsList =
        (json['items'] as List?)
            ?.map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    return OrderModel(
      id: json['_id'] ?? '',
      items: itemsList,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'pending',
      paymentMethod: json['paymentMethod'] ?? 'COD',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      deliveryAddress: json['deliveryAddress'] != null &&
              json['deliveryAddress'] is Map<String, dynamic>
          ? DeliveryAddressModel.fromJson(
              json['deliveryAddress'] as Map<String, dynamic>)
          : null,
    );
  }
}

class DeliveryAddressModel {
  final String id;
  final String fullName;
  final String phone;
  final String addressLine;
  final String city;
  final String district;
  final String ward;
  final bool isDefault;

  DeliveryAddressModel({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.addressLine,
    required this.city,
    required this.district,
    required this.ward,
    required this.isDefault,
  });

  factory DeliveryAddressModel.fromJson(Map<String, dynamic> json) {
    return DeliveryAddressModel(
      id: json['_id'] ?? '',
      fullName: json['fullName'] ?? '',
      phone: json['phone'] ?? '',
      addressLine: json['addressLine'] ?? '',
      city: json['city'] ?? '',
      district: json['district'] ?? '',
      ward: json['ward'] ?? '',
      isDefault: json['isDefault'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'fullName': fullName,
    'phone': phone,
    'addressLine': addressLine,
    'city': city,
    'district': district,
    'ward': ward,
  };
}

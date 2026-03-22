import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/product_provider.dart';
import '../constants/api_constants.dart';
import '../l10n/app_localizations.dart';
import 'package:intl/intl.dart';
import '../providers/review_provider.dart';
import '../models/review_model.dart';
import 'add_review_screen.dart';
import 'chat_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _quantity = 1;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductProvider>().fetchProductById(widget.productId);
      context.read<ReviewProvider>().fetchProductReviews(widget.productId);
    });
  }

  Future<void> _addToCart() async {
    final auth = context.read<AuthProvider>();
    final cart = context.read<CartProvider>();

    if (auth.token == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppLocalizations.of(context).translate('login')),
        ),
      );
      return;
    }

    await cart.addToCart(
      token: auth.token!,
      productId: widget.productId,
      quantity: _quantity,
    );

    if (!mounted) return;

    if (cart.error != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(cart.error!)));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '${AppLocalizations.of(context).translate('add_to_cart')} $_quantity',
          ),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context).translate('product_details')),
      ),
      body: Consumer<ProductProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null || provider.selectedProduct == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    '${AppLocalizations.of(context).translate('error_generic')}: ${provider.error ?? "Product not found"}',
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: Text(
                      AppLocalizations.of(context).translate('start_shopping'),
                    ),
                  ),
                ],
              ),
            );
          }

          final product = provider.selectedProduct!;

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  height: 300,
                  color: Colors.grey[100],
                  child: Hero(
                    tag: 'product-image-${product.id}',
                    child: product.image.isNotEmpty
                        ? Image.network(
                            ApiConstants.getImageUrl(product.image),
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const Center(
                              child: Icon(Icons.image_not_supported),
                            ),
                          )
                        : const Center(child: Icon(Icons.image_not_supported)),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.name,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '\₫${product.price.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.teal,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Text(
                            '${AppLocalizations.of(context).translate('stock') ?? 'Stock'}: ',
                          ),
                          Text(
                            '${product.stock}',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 16),
                      const Text(
                        'Description',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        product.description.isNotEmpty
                            ? product.description
                            : AppLocalizations.of(
                                context,
                              ).translate('no_products_available'),
                      ),
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Đánh giá từ khách hàng',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                          ),
                          TextButton.icon(
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => AddReviewScreen(
                                    productId: product.id,
                                    productName: product.name,
                                  ),
                                ),
                              );
                            },
                            icon: const Icon(Icons.rate_review_outlined, size: 18),
                            label: const Text('Viết đánh giá'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Consumer<ReviewProvider>(
                        builder: (context, reviewProvider, _) {
                          if (reviewProvider.isLoading) {
                            return const Center(child: CircularProgressIndicator());
                          }
                          if (reviewProvider.productReviews.isEmpty) {
                            return const Padding(
                              padding: EdgeInsets.symmetric(vertical: 20),
                              child: Center(
                                child: Text(
                                  'Chưa có đánh giá nào cho món này.',
                                  style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic),
                                ),
                              ),
                            );
                          }
                          return ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: reviewProvider.productReviews.length,
                            itemBuilder: (context, index) {
                              final review = reviewProvider.productReviews[index];
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        CircleAvatar(
                                          radius: 14,
                                          backgroundColor: Colors.teal[50],
                                          child: Text(
                                            review.userName[0].toUpperCase(),
                                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(review.userName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                        const Spacer(),
                                        Row(
                                          children: List.generate(5, (starIndex) {
                                            return Icon(
                                              starIndex < review.rating ? Icons.star : Icons.star_border,
                                              color: Colors.amber,
                                              size: 14,
                                            );
                                          }),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(review.comment, style: const TextStyle(fontSize: 14, color: Colors.black87)),
                                    const SizedBox(height: 4),
                                    Text(
                                      DateFormat('dd/MM/yyyy').format(review.createdAt),
                                      style: const TextStyle(fontSize: 10, color: Colors.grey),
                                    ),
                                    const Divider(height: 24, thickness: 0.5),
                                  ],
                                ),
                              );
                            },
                          );
                        },
                      ),
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          Text(
                            '${AppLocalizations.of(context).translate('quantity')}: ',
                          ),
                          const SizedBox(width: 16),
                          Container(
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.teal),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.remove),
                                  onPressed: _quantity > 1
                                      ? () => setState(() => _quantity--)
                                      : null,
                                ),
                                Text(
                                  '$_quantity',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.add),
                                  onPressed: _quantity < product.stock
                                      ? () => setState(() => _quantity++)
                                      : null,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: product.stock > 0 ? _addToCart : null,
                          child: Text(
                            AppLocalizations.of(
                              context,
                            ).translate('add_to_cart'),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: () {
                             Navigator.of(context).push(
                               MaterialPageRoute(builder: (_) => ChatScreen()),
                             );
                          },
                          icon: const Icon(Icons.chat_bubble_outline),
                          label: const Text('Chat với Chủ quán'),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: Text(
                            AppLocalizations.of(
                              context,
                            ).translate('start_shopping'),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

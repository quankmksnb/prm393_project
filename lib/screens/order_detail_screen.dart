import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/product_models.dart';
import '../providers/auth_provider.dart';
import '../providers/order_provider.dart';
import 'add_review_screen.dart';

class OrderDetailScreen extends StatelessWidget {
  final OrderModel order;

  const OrderDetailScreen({super.key, required this.order});

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Colors.green;
      case 'delivering':
        return Colors.blue;
      case 'confirmed':
        return Colors.orange;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _statusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'delivering':
        return 'Đang giao hàng';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã huỷ';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final statusColor = _statusColor(order.status);

    return Scaffold(
      backgroundColor: theme.colorScheme.surfaceVariant.withOpacity(0.3),
      appBar: AppBar(
        title: Text(
          'Chi tiết đơn hàng',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Order ID + Status badge ──────────────────────────────────
            _SectionCard(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Mã đơn hàng',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '#${order.id.length >= 8 ? order.id.substring(0, 8).toUpperCase() : order.id.toUpperCase()}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        order.createdAt != null
                            ? DateFormat(
                                'dd/MM/yyyy  HH:mm',
                              ).format(order.createdAt!)
                            : '',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: statusColor.withOpacity(0.4)),
                    ),
                    child: Text(
                      _statusLabel(order.status),
                      style: TextStyle(
                        color: statusColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // ── Status timeline ──────────────────────────────────────────
            _OrderTimeline(currentStatus: order.status),

            const SizedBox(height: 12),

            // ── Sản phẩm đã đặt ─────────────────────────────────────────
            _SectionCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Sản phẩm đã đặt',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...order.items.map((item) => _OrderItemRow(item: item, orderStatus: order.status)),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Tổng cộng',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Text(
                        '₫${NumberFormat('#,###').format(order.totalAmount.toInt())}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Colors.teal,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // ── Địa chỉ giao hàng ────────────────────────────────────────────
            if (order.deliveryAddress != null) ...[
              _SectionCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Địa chỉ nhận hàng',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _InfoRow(
                      icon: Icons.person_outline,
                      label: 'Người nhận',
                      value: order.deliveryAddress!.fullName,
                    ),
                    const SizedBox(height: 8),
                    _InfoRow(
                      icon: Icons.phone_outlined,
                      label: 'Số điện thoại',
                      value: order.deliveryAddress!.phone,
                    ),
                    const SizedBox(height: 8),
                    _InfoRow(
                      icon: Icons.location_on_outlined,
                      label: 'Địa chỉ nhận',
                      value:
                          '${order.deliveryAddress!.addressLine}, ${order.deliveryAddress!.ward}, ${order.deliveryAddress!.district}, ${order.deliveryAddress!.city}',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],

            // ── Thanh toán ───────────────────────────────────────────────
            _SectionCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Thông tin thanh toán',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _InfoRow(
                    icon: Icons.payment_outlined,
                    label: 'Phương thức',
                    value: order.paymentMethod == 'COD'
                        ? 'Thanh toán khi nhận hàng (COD)'
                        : order.paymentMethod,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // ── Nút huỷ đơn (chỉ khi pending) ───────────────────────────
            if (order.status.toLowerCase() == 'pending')
              SizedBox(
                width: double.infinity,
                child: _CancelButton(orderId: order.id),
              ),

            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

// ─── Widgets nhỏ ─────────────────────────────────────────────────────────────

class _SectionCard extends StatelessWidget {
  final Widget child;
  const _SectionCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: Colors.grey.shade500),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade500,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _OrderItemRow extends StatelessWidget {
  final OrderItemModel item;
  final String orderStatus;
  const _OrderItemRow({required this.item, required this.orderStatus});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Ảnh sản phẩm
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: item.image.isNotEmpty
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      item.image,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) =>
                          const Icon(Icons.fastfood, color: Colors.grey),
                    ),
                  )
                : const Icon(Icons.fastfood, color: Colors.grey),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.productName,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  '₫${NumberFormat('#,###').format(item.price.toInt())} × ${item.quantity}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '₫${NumberFormat('#,###').format((item.price * item.quantity).toInt())}',
                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.teal),
              ),
              if (orderStatus.toLowerCase() == 'completed')
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => AddReviewScreen(
                            productId: item.productId,
                            productName: item.productName,
                          ),
                        ),
                      );
                    },
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      backgroundColor: Colors.orange.shade50,
                      foregroundColor: Colors.orange,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text(
                      'Đánh giá',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Timeline hiển thị tiến trình đơn hàng
class _OrderTimeline extends StatelessWidget {
  final String currentStatus;

  const _OrderTimeline({required this.currentStatus});

  static const _steps = [
    ('pending', 'Chờ xác nhận', Icons.hourglass_top_rounded),
    ('confirmed', 'Đã xác nhận', Icons.check_circle_outline),
    ('delivering', 'Đang giao', Icons.local_shipping_outlined),
    ('completed', 'Hoàn thành', Icons.done_all),
  ];

  int get _currentIndex {
    final idx = _steps.indexWhere(
      (s) => s.$1 == currentStatus.toLowerCase(),
    );
    return idx == -1 ? 0 : idx;
  }

  @override
  Widget build(BuildContext context) {
    if (currentStatus.toLowerCase() == 'cancelled') {
      return _SectionCard(
        child: Row(
          children: [
            const Icon(Icons.cancel_outlined, color: Colors.red, size: 22),
            const SizedBox(width: 10),
            const Text(
              'Đơn hàng đã bị huỷ',
              style: TextStyle(
                color: Colors.red,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      );
    }

    final current = _currentIndex;

    return _SectionCard(
      child: Row(
        children: List.generate(_steps.length * 2 - 1, (i) {
          if (i.isOdd) {
            // Đường nối
            final stepIndex = i ~/ 2;
            final isActive = stepIndex < current;
            return Expanded(
              child: Container(
                height: 3,
                color: isActive ? Colors.teal : Colors.grey.shade300,
              ),
            );
          }

          final stepIndex = i ~/ 2;
          final (_, label, icon) = _steps[stepIndex];
          final isDone = stepIndex < current;
          final isActive = stepIndex == current;

          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isDone || isActive
                      ? Colors.teal
                      : Colors.grey.shade200,
                ),
                child: Icon(
                  isDone ? Icons.check : icon,
                  size: 18,
                  color: isDone || isActive ? Colors.white : Colors.grey,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 9,
                  fontWeight:
                      isActive ? FontWeight.bold : FontWeight.normal,
                  color: isActive ? Colors.teal : Colors.grey.shade600,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          );
        }),
      ),
    );
  }
}

/// Nút huỷ đơn với confirm dialog
class _CancelButton extends StatefulWidget {
  final String orderId;
  const _CancelButton({required this.orderId});

  @override
  State<_CancelButton> createState() => _CancelButtonState();
}

class _CancelButtonState extends State<_CancelButton> {
  bool _loading = false;

  Future<void> _cancel() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Huỷ đơn hàng'),
        content: const Text('Bạn có chắc muốn huỷ đơn hàng này không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Không'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Huỷ đơn'),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    setState(() => _loading = true);
    final token = context.read<AuthProvider>().token!;
    await context.read<OrderProvider>().cancelOrder(token, widget.orderId);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đã huỷ đơn hàng'),
          backgroundColor: Colors.red,
        ),
      );
      Navigator.of(context).pop(); // quay lại danh sách
    }
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: _loading ? null : _cancel,
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.red,
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      icon: _loading
          ? const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Colors.white,
              ),
            )
          : const Icon(Icons.cancel_outlined, color: Colors.white),
      label: Text(
        _loading ? 'Đang huỷ...' : 'Huỷ đơn hàng',
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 15,
        ),
      ),
    );
  }
}

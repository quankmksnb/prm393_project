import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

import '../providers/auth_provider.dart';
import '../providers/order_provider.dart';
import '../l10n/app_localizations.dart';
import 'order_detail_screen.dart';

class OrderHistoryScreen extends StatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  State<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen>
    with WidgetsBindingObserver {
  bool _hasFetchedOnce = false;

  String _selectedStatus = '';
  final List<Map<String, String>> _statusFilters = [
    {'value': '', 'label': 'Tất cả'},
    {'value': 'pending', 'label': 'Chờ xác nhận'},
    {'value': 'confirmed', 'label': 'Đã xác nhận'},
    {'value': 'delivering', 'label': 'Đang giao'},
    {'value': 'completed', 'label': 'Hoàn thành'},
    {'value': 'cancelled', 'label': 'Đã huỷ'},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchOrders();
      _hasFetchedOnce = true;
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  /// Gọi lại mỗi khi app resume (kể cả quay lại từ màn hình khác)
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _fetchOrders();
    }
  }

  /// Gọi lại khi dependency thay đổi (bao gồm khi tab này được chọn lại
  /// sau khi navigate về home từ checkout)
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_hasFetchedOnce) {
      _fetchOrders();
    }
  }

  Future<void> _fetchOrders() async {
    if (!mounted) return;
    final token = context.read<AuthProvider>().token;
    if (token != null) {
      await context.read<OrderProvider>().fetchUserOrders(token);
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Colors.green;
      case 'delivering':
        return Colors.blue;
      case 'confirmed':
        return Colors.orange;
      case 'pending':
        return Colors.grey;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'delivering':
        return 'Đang giao';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã huỷ';
      default:
        return status.toUpperCase();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context).translate('order_history')),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Làm mới',
            onPressed: _fetchOrders,
          ),
        ],
      ),
      body: Consumer<OrderProvider>(
        builder: (context, provider, _) {
          final filteredOrders = provider.orders.where((o) {
            if (_selectedStatus.isEmpty) return true;
            return o.status == _selectedStatus;
          }).toList();

          Widget content;

          if (provider.isLoading) {
            content = const Center(child: CircularProgressIndicator());
          } else if (filteredOrders.isEmpty) {
            content = RefreshIndicator(
              onRefresh: _fetchOrders,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.6,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.receipt_long_outlined,
                          size: 64,
                          color: Colors.grey,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _selectedStatus.isEmpty 
                            ? AppLocalizations.of(context).translate('no_orders') 
                            : 'Không có đơn hàng nào ở trạng thái này',
                        ),
                        const SizedBox(height: 24),
                        if (_selectedStatus.isEmpty)
                          ElevatedButton(
                            onPressed: () => Navigator.of(context).pop(),
                            child: Text(
                              AppLocalizations.of(context).translate('start_shopping'),
                            ),
                          )
                        else
                          OutlinedButton(
                            onPressed: () => setState(() => _selectedStatus = ''),
                            child: const Text('Xem tất cả đơn hàng'),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          } else {
            content = RefreshIndicator(
              onRefresh: _fetchOrders,
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: filteredOrders.length,
                itemBuilder: (context, index) {
                  final order = filteredOrders[index];
                  final statusColor = _getStatusColor(order.status);

                return Card(
                  margin: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => OrderDetailScreen(order: order),
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Đơn #${order.id.length >= 8 ? order.id.substring(0, 8).toUpperCase() : order.id}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: statusColor.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: statusColor.withOpacity(0.3),
                                  ),
                                ),
                                child: Text(
                                  _getStatusLabel(order.status),
                                  style: TextStyle(
                                    color: statusColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Icon(
                                Icons.calendar_today_outlined,
                                size: 16,
                                color: Colors.grey.shade600,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                order.createdAt != null
                                    ? DateFormat(
                                        'dd/MM/yyyy - HH:mm',
                                      ).format(order.createdAt!)
                                    : 'N/A',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(
                                Icons.inventory_2_outlined,
                                size: 16,
                                color: Colors.grey.shade600,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '${order.items.fold(0, (sum, item) => sum + item.quantity)} sản phẩm',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 12),
                            child: Divider(height: 1),
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Tổng tiền:',
                                style: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 14,
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
                          const SizedBox(height: 12),
                          const Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Text(
                                'Xem chi tiết',
                                style: TextStyle(
                                  color: Colors.teal,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                ),
                              ),
                              SizedBox(width: 4),
                              Icon(
                                Icons.arrow_forward_ios,
                                size: 12,
                                color: Colors.teal,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        }

          return Column(
            children: [
              Container(
                height: 50,
                margin: const EdgeInsets.only(top: 8, bottom: 4),
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _statusFilters.length,
                  itemBuilder: (ctx, i) {
                    final filter = _statusFilters[i];
                    final isSelected = _selectedStatus == filter['value'];
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(
                          filter['label']!,
                          style: TextStyle(
                            color: isSelected ? Colors.white : Colors.black87,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                        selected: isSelected,
                        selectedColor: Colors.teal,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() => _selectedStatus = filter['value']!);
                          }
                        },
                      ),
                    );
                  },
                ),
              ),
              Expanded(child: content),
            ],
          );
        },
      ),
    );
  }
}


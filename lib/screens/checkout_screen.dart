import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';
import '../providers/address_provider.dart';
import '../providers/order_provider.dart';
import '../widgets/loading_indicator.dart';
import '../l10n/app_localizations.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String _selectedPaymentMethod = 'COD';
  String? _selectedAddressId;
  bool _processingOrder = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = context.read<AuthProvider>().token;
      if (token != null) {
        context.read<AddressProvider>().fetchMyAddresses(token);
      }
    });
  }

  Future<void> _placeOrder() async {
    if (_selectedAddressId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context).translate('address') +
                ' ' +
                AppLocalizations.of(context).translate('error_generic'),
          ),
        ),
      );
      return;
    }

    if (mounted) setState(() => _processingOrder = true);

    try {
      final auth = context.read<AuthProvider>();
      final order = context.read<OrderProvider>();
      final cart = context.read<CartProvider>();

      final result = await order.checkout(
        token: auth.token!,
        addressId: _selectedAddressId!,
        paymentMethod: _selectedPaymentMethod,
      );

      if (!mounted) return;

      setState(() => _processingOrder = false);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Order placed successfully'),
        ),
      );

      // Clear cart and navigate back
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        await cart.fetchCart(auth.token!);
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _processingOrder = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final addresses = context.watch<AddressProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context).translate('checkout')),
      ),
      body: _processingOrder
          ? Center(
              child: LoadingIndicator(
                message:
                    AppLocalizations.of(context).translate('processing') ?? '',
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Order Summary
                  Text(
                    AppLocalizations.of(context).translate('order_summary'),
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        children: [
                          for (var item in (cart.cart?.items ?? []))
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item.productName,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        Text(
                                          'x${item.quantity}',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Text(
                                    '\₫${item.subtotal.toStringAsFixed(0)}',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          const Divider(),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${AppLocalizations.of(context).translate('total')}:',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                '\₫${cart.totalPrice.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.teal,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Delivery Address
                  Text(
                    AppLocalizations.of(context).translate('address'),
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (addresses.isLoading)
                    const Center(child: CircularProgressIndicator())
                  else if ((addresses.addresses).isEmpty)
                    Text(
                      AppLocalizations.of(context).translate('no_address') ??
                          'No addresses. Please add one.',
                    )
                  else
                    Column(
                      children: [
                        for (var addr in addresses.addresses)
                          Card(
                            child: RadioListTile<String>(
                              value: addr.id,
                              groupValue:
                                  _selectedAddressId ??
                                  addresses.defaultAddress?.id,
                              onChanged: (value) =>
                                  setState(() => _selectedAddressId = value),
                              title: Text(addr.fullName),
                              subtitle: Text(
                                '${addr.addressLine}, ${addr.ward}, ${addr.district}, ${addr.city}',
                              ),
                            ),
                          ),
                      ],
                    ),
                  const SizedBox(height: 24),

                  // Payment Method
                  Text(
                    AppLocalizations.of(context).translate('payment_method') ??
                        'Payment Method',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: RadioListTile<String>(
                      value: 'COD',
                      groupValue: _selectedPaymentMethod,
                      onChanged: (value) =>
                          setState(() => _selectedPaymentMethod = value!),
                      title: Text(
                        AppLocalizations.of(context).translate('cod') ??
                            'Cash on Delivery (COD)',
                      ),
                    ),
                  ),
                  Card(
                    child: RadioListTile<String>(
                      value: 'PayPal',
                      groupValue: _selectedPaymentMethod,
                      onChanged: (value) =>
                          setState(() => _selectedPaymentMethod = value!),
                      title: Text('PayPal'),
                    ),
                  ),
                  const SizedBox(height: 24),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _placeOrder,
                      child: Text(
                        AppLocalizations.of(
                          context,
                        ).translate('proceed_checkout'),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../providers/order_provider.dart';

class VNPayScreen extends StatefulWidget {
  final String paymentUrl;

  const VNPayScreen({super.key, required this.paymentUrl});

  @override
  State<VNPayScreen> createState() => _VNPayScreenState();
}

class _VNPayScreenState extends State<VNPayScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onNavigationRequest: (NavigationRequest request) {
            if (request.url.startsWith('https://foodify.com/vnpay-return')) {
              _handleReturnUrl(request.url);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.paymentUrl));
  }

  Future<void> _handleReturnUrl(String url) async {
    final uri = Uri.parse(url);
    final token = context.read<AuthProvider>().token;
    
    if (token != null) {
      try {
        final success = await context.read<OrderProvider>().verifyVNPayReturn(
          token, 
          uri.queryParameters,
        );
        if (mounted) {
          Navigator.of(context).pop(success);
        }
      } catch (e) {
        if (mounted) {
          Navigator.of(context).pop(false);
        }
      }
    } else {
      Navigator.of(context).pop(false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thanh toán VNPay'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(false),
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }
}

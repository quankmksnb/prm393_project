import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import 'login_screen.dart';
import '../widgets/loading_indicator.dart';
import '../l10n/app_localizations.dart';

class OtpScreen extends StatefulWidget {
  final String email;

  const OtpScreen({super.key, required this.email});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _otpController = TextEditingController();

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _verifyOtp() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthProvider>();

    try {
      final response = await auth.verifyOtp(
        email: widget.email,
        otp: _otpController.text.trim(),
      );

      final message = response['message'] as String?;

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            message ?? AppLocalizations.of(context).translate('otp_verified'),
          ),
        ),
      );

      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
        ..clearSnackBars()
        ..showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context).translate('verify_otp')),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Consumer<AuthProvider>(
            builder: (context, auth, child) {
              final isLoading = auth.status == AuthStatus.loading;
              return Stack(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 24),
                      Text(
                        AppLocalizations.of(context).translate('verify_otp'),
                        style: const TextStyle(fontSize: 18),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        widget.email,
                        style: const TextStyle(color: Colors.grey),
                      ),
                      const SizedBox(height: 24),
                      Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            TextFormField(
                              controller: _otpController,
                              decoration: InputDecoration(
                                labelText: AppLocalizations.of(
                                  context,
                                ).translate('verify_otp'),
                                prefixIcon: const Icon(Icons.lock_outline),
                              ),
                              keyboardType: TextInputType.number,
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return AppLocalizations.of(
                                    context,
                                  ).translate('otp_required');
                                }
                                if (value.trim().length < 4) {
                                  return AppLocalizations.of(
                                    context,
                                  ).translate('otp_invalid');
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 24),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: isLoading ? null : _verifyOtp,
                                child: Text(
                                  AppLocalizations.of(
                                    context,
                                  ).translate('verify_otp'),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            TextButton(
                              onPressed: isLoading
                                  ? null
                                  : () => Navigator.of(context).pop(),
                              child: Text(
                                AppLocalizations.of(context).translate('login'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (isLoading)
                    ColoredBox(
                      color: Colors.black26,
                      child: Center(
                        child: LoadingIndicator(
                          message: AppLocalizations.of(
                            context,
                          ).translate('verifying'),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

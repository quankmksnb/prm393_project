import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../l10n/app_localizations.dart';
import 'login_screen.dart';
import 'address_management_screen.dart';
import 'edit_profile_screen.dart';
import 'chat_screen.dart';
import '../constants/api_constants.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context).translate('profile')),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_note),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const EditProfileScreen()),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar Header
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: Colors.teal[100],
                    backgroundImage: user?.avatar != null ? NetworkImage(ApiConstants.getImageUrl(user!.avatar!)) : null,
                    child: user?.avatar == null 
                      ? const Icon(Icons.person, size: 50, color: Colors.teal)
                      : null,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user?.name ?? 'Unknown',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    user?.email ?? '',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // User Info Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppLocalizations.of(context).translate('user_information') ?? 'User Information',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildInfoRow(
                      Icons.person,
                      AppLocalizations.of(context).translate('full_name'),
                      user?.name ?? '-',
                    ),
                    const SizedBox(height: 16),
                    _buildInfoRow(
                      Icons.email,
                      AppLocalizations.of(context).translate('email'),
                      user?.email ?? '-',
                    ),
                    const SizedBox(height: 16),
                    _buildInfoRow(
                      Icons.phone,
                      'Số điện thoại',
                      user?.phone ?? 'Chưa cập nhật',
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Menu Items
            ListTile(
              leading: const Icon(Icons.location_on, color: Colors.teal),
              title: Text(
                AppLocalizations.of(context).translate('manage_addresses'),
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => const AddressManagementScreen(),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.chat_bubble, color: Colors.teal),
              title: const Text('Chat với Chủ quán'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => ChatScreen()),
                );
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.settings, color: Colors.teal),
              title: Text(AppLocalizations.of(context).translate('settings')),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      AppLocalizations.of(context).translate('coming_soon'),
                    ),
                  ),
                );
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.help, color: Colors.teal),
              title: Text(
                AppLocalizations.of(context).translate('help_support'),
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      AppLocalizations.of(context).translate('coming_soon'),
                    ),
                  ),
                );
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.privacy_tip, color: Colors.teal),
              title: Text(
                AppLocalizations.of(context).translate('privacy_policy'),
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      AppLocalizations.of(context).translate('coming_soon'),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                icon: const Icon(Icons.logout),
                label: Text(
                  AppLocalizations.of(context).translate('logout'),
                  style: const TextStyle(color: Colors.white),
                ),
                onPressed: () async {
                  await auth.logout();
                  if (context.mounted) {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                      (route) => false,
                    );
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: Colors.teal),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

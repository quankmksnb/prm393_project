import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../providers/address_provider.dart';
import '../models/product_models.dart';
import '../widgets/loading_indicator.dart';
import '../l10n/app_localizations.dart';

class AddressManagementScreen extends StatefulWidget {
  const AddressManagementScreen({super.key});

  @override
  State<AddressManagementScreen> createState() =>
      _AddressManagementScreenState();
}

class _AddressManagementScreenState extends State<AddressManagementScreen> {
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

  void _showAddressForm({DeliveryAddressModel? address}) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => AddressFormScreen(address: address)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context).translate('manage_addresses')),
      ),
      body: Consumer<AddressProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: LoadingIndicator());
          }

          if (provider.addresses.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.location_off_outlined,
                    size: 64,
                    color: Colors.grey,
                  ),
                  const SizedBox(height: 16),
                  Text(AppLocalizations.of(context).translate('no_addresses')),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => _showAddressForm(),
                    child: Text(
                      AppLocalizations.of(context).translate('add_address'),
                    ),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: provider.addresses.length,
            itemBuilder: (context, index) {
              final addr = provider.addresses[index];
              return Card(
                child: ListTile(
                  leading: Icon(
                    addr.isDefault
                        ? Icons.check_circle
                        : Icons.location_on_outlined,
                    color: addr.isDefault ? Colors.teal : Colors.grey,
                  ),
                  title: Text(addr.fullName),
                  subtitle: Text(
                    '${addr.addressLine}, ${addr.ward}, ${addr.district}, ${addr.city}',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: PopupMenuButton(
                    itemBuilder: (context) => [
                      PopupMenuItem(
                        child: Text(
                          AppLocalizations.of(
                            context,
                          ).translate('edit_address'),
                        ),
                        onTap: () => _showAddressForm(address: addr),
                      ),
                      if (!addr.isDefault)
                        PopupMenuItem(
                          child: Text(
                            AppLocalizations.of(
                              context,
                            ).translate('set_as_default'),
                          ),
                          onTap: () {
                            context.read<AddressProvider>().setDefaultAddress(
                              token: context.read<AuthProvider>().token!,
                              addressId: addr.id,
                            );
                          },
                        ),
                      PopupMenuItem(
                        child: Text(
                          AppLocalizations.of(
                            context,
                          ).translate('delete_address'),
                          style: const TextStyle(color: Colors.red),
                        ),
                        onTap: () {
                          showDialog(
                            context: context,
                            builder: (context) => AlertDialog(
                              title: Text(
                                AppLocalizations.of(
                                  context,
                                ).translate('delete_address'),
                              ),
                              content: Text(
                                AppLocalizations.of(
                                  context,
                                ).translate('are_you_sure'),
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(context),
                                  child: Text(
                                    AppLocalizations.of(
                                      context,
                                    ).translate('cancel'),
                                  ),
                                ),
                                TextButton(
                                  onPressed: () {
                                    context
                                        .read<AddressProvider>()
                                        .deleteAddress(
                                          token: context
                                              .read<AuthProvider>()
                                              .token!,
                                          addressId: addr.id,
                                        );
                                    Navigator.pop(context);
                                  },
                                  child: Text(
                                    AppLocalizations.of(
                                      context,
                                    ).translate('delete_address'),
                                    style: const TextStyle(color: Colors.red),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddressForm(),
        child: const Icon(Icons.add),
      ),
    );
  }
}

class AddressFormScreen extends StatefulWidget {
  final DeliveryAddressModel? address;

  const AddressFormScreen({super.key, this.address});

  @override
  State<AddressFormScreen> createState() => _AddressFormScreenState();
}

class _AddressFormScreenState extends State<AddressFormScreen> {
  late TextEditingController _fullNameController;
  late TextEditingController _phoneController;
  late TextEditingController _addressLineController;
  late TextEditingController _cityController;
  late TextEditingController _districtController;
  late TextEditingController _wardController;

  final _formKey = GlobalKey<FormState>();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _initializeControllers();
  }

  void _initializeControllers() {
    _fullNameController = TextEditingController(
      text: widget.address?.fullName ?? '',
    );
    _phoneController = TextEditingController(text: widget.address?.phone ?? '');
    _addressLineController = TextEditingController(
      text: widget.address?.addressLine ?? '',
    );
    _cityController = TextEditingController(text: widget.address?.city ?? '');
    _districtController = TextEditingController(
      text: widget.address?.district ?? '',
    );
    _wardController = TextEditingController(text: widget.address?.ward ?? '');
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _addressLineController.dispose();
    _cityController.dispose();
    _districtController.dispose();
    _wardController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    if (mounted) setState(() => _isSubmitting = true);

    final token = context.read<AuthProvider>().token!;
    final addressProvider = context.read<AddressProvider>();

    final address = DeliveryAddressModel(
      id: widget.address?.id ?? '',
      fullName: _fullNameController.text,
      phone: _phoneController.text,
      addressLine: _addressLineController.text,
      city: _cityController.text,
      district: _districtController.text,
      ward: _wardController.text,
      isDefault: widget.address?.isDefault ?? false,
    );

    try {
      if (widget.address != null) {
        await addressProvider.updateAddress(
          token: token,
          addressId: widget.address!.id,
          address: address,
        );
      } else {
        await addressProvider.addAddress(token: token, address: address);
      }

      if (!mounted) return;
      Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }

    if (mounted) setState(() => _isSubmitting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.address != null
              ? AppLocalizations.of(context).translate('edit_address')
              : AppLocalizations.of(context).translate('add_address'),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _fullNameController,
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(
                    context,
                  ).translate('full_name'),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return AppLocalizations.of(context).translate('full_name') +
                        ' is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneController,
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(
                    context,
                  ).translate('phone_number'),
                ),
                keyboardType: TextInputType.phone,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return AppLocalizations.of(
                          context,
                        ).translate('phone_number') +
                        ' is required';
                  }
                  if (!RegExp(r'^\d{9,11}$').hasMatch(value.trim())) {
                    return AppLocalizations.of(
                          context,
                        ).translate('phone_number') +
                        ' must be 9-11 digits';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _addressLineController,
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(context).translate('address'),
                ),
                minLines: 2,
                maxLines: 4,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return AppLocalizations.of(context).translate('address') +
                        ' is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _cityController,
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(context).translate('city'),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return AppLocalizations.of(context).translate('city') +
                        ' is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _districtController,
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(context).translate('district'),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return AppLocalizations.of(context).translate('district') +
                        ' is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _wardController,
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(context).translate('ward'),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return AppLocalizations.of(context).translate('ward') +
                        ' is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitForm,
                  child: Text(
                    _isSubmitting
                        ? AppLocalizations.of(context).translate('saving')
                        : AppLocalizations.of(
                            context,
                          ).translate('save_address'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

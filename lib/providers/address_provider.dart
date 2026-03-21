import 'package:flutter/material.dart';

import '../models/product_models.dart';
import '../services/address_service.dart';

class AddressProvider extends ChangeNotifier {
  final AddressService _addressService;

  AddressProvider({AddressService? addressService})
    : _addressService = addressService ?? AddressService();

  List<DeliveryAddressModel> _addresses = [];
  List<DeliveryAddressModel> get addresses => _addresses;

  DeliveryAddressModel? _defaultAddress;
  DeliveryAddressModel? get defaultAddress => _defaultAddress;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  Future<void> fetchMyAddresses(String token) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _addresses = await _addressService.getMyAddresses(token);
      _defaultAddress = _addresses.isNotEmpty
          ? _addresses.firstWhere(
              (a) => a.isDefault,
              orElse: () => _addresses.first,
            )
          : null;
    } catch (e) {
      _error = e.toString();
      _addresses = [];
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> addAddress({
    required String token,
    required DeliveryAddressModel address,
  }) async {
    _error = null;

    try {
      await _addressService.addAddress(token: token, address: address);
      await fetchMyAddresses(token);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> updateAddress({
    required String token,
    required String addressId,
    required DeliveryAddressModel address,
  }) async {
    _error = null;

    try {
      await _addressService.updateAddress(
        token: token,
        addressId: addressId,
        address: address,
      );
      await fetchMyAddresses(token);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> deleteAddress({
    required String token,
    required String addressId,
  }) async {
    _error = null;

    try {
      await _addressService.deleteAddress(token: token, addressId: addressId);
      await fetchMyAddresses(token);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> setDefaultAddress({
    required String token,
    required String addressId,
  }) async {
    _error = null;

    try {
      await _addressService.setDefaultAddress(
        token: token,
        addressId: addressId,
      );
      await fetchMyAddresses(token);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }
}

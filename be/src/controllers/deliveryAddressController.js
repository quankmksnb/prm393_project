// src/controllers/deliveryAddressController.js
import DeliveryAddress from "../models/DeliveryAddress.js";

// 🟢 Get all delivery addresses for current user
export const getMyAddresses = async (req, res) => {
  try {
    const addresses = await DeliveryAddress.find({ user: req.user.id }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Add new address
export const addAddress = async (req, res) => {
  try {
    const { fullName, phone, addressLine, city, district, ward, isDefault } =
      req.body;

    if (!fullName || !phone || !addressLine || !city || !district || !ward)
      return res.status(400).json({ message: "Missing required fields" });

    // Nếu isDefault = true, bỏ default ở các địa chỉ khác
    if (isDefault) {
      await DeliveryAddress.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } }
      );
    }

    const address = await DeliveryAddress.create({
      user: req.user.id,
      fullName,
      phone,
      addressLine,
      city,
      district,
      ward,
      isDefault,
    });

    res.status(201).json({ message: "Address added successfully", address });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Update address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, addressLine, city, district, ward, isDefault } =
      req.body;

    const address = await DeliveryAddress.findOne({ _id: id, user: req.user.id });
    if (!address)
      return res.status(404).json({ message: "Address not found" });

    if (isDefault) {
      await DeliveryAddress.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } }
      );
    }

    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.addressLine = addressLine || address.addressLine;
    address.city = city || address.city;
    address.district = district || address.district;
    address.ward = ward || address.ward;
    address.isDefault = isDefault ?? address.isDefault;

    await address.save();
    res.status(200).json({ message: "Address updated successfully", address });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await DeliveryAddress.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });
    if (!address)
      return res.status(404).json({ message: "Address not found" });

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Set default address manually
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await DeliveryAddress.findOne({ _id: id, user: req.user.id });
    if (!address)
      return res.status(404).json({ message: "Address not found" });

    // remove old default
    await DeliveryAddress.updateMany(
      { user: req.user.id },
      { $set: { isDefault: false } }
    );

    address.isDefault = true;
    await address.save();

    res.status(200).json({ message: "Default address updated", address });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getDefaultAddress = async (req, res) => {
  try {
    const address = await DeliveryAddress.findOne({
      user: req.user.id,
      isDefault: true,
    });

    if (!address)
      return res.status(404).json({ message: "No default address found" });

    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

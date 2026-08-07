const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true, // e.g., 'Main Warehouse', 'Downtown Office'
  },
  type: {
    type: String,
    default: 'Default', // e.g., 'Vendor', 'Default Pickup'
  },
  street: {
    type: String,
    required: true,
  },
  building: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  contactName: {
    type: String,
    required: true,
  },
  contactPhone: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);

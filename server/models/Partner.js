const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  partnerType: {
    type: String,
    enum: ['API-integrated', 'Manual', 'Bus Cargo', 'Local Last-mile', 'Regional Cargo'],
    required: true
  },
  gstDetails: {
    gstNumber: String,
    verified: { type: Boolean, default: false }
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    ifscCode: String
  },
  contactPersons: [{
    name: String,
    role: String,
    phone: String,
    email: String
  }],
  serviceability: {
    serviceCities: [String],
    servicePincodes: [String],
    maxWeight: Number, // in kg
    insuranceAvailable: { type: Boolean, default: false },
    codSupported: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Partner', partnerSchema);

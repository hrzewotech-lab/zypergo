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
    maxWeight: { type: Number, default: 50 }, // in kg
    insuranceAvailable: { type: Boolean, default: false },
    codSupported: { type: Boolean, default: false },
    supportedParcelTypes: {
      type: [String],
      default: ['Document', 'Clothes', 'General Parcel']
    }
  },

  // --- Dispatch & Routing Fields ---
  rates: {
    baseRate: { type: Number, default: 50 },      // flat base charge
    perKgRate: { type: Number, default: 10 },      // per additional kg
    perKmRate: { type: Number, default: 5 },       // per km (for local)
    codCharge: { type: Number, default: 25 }       // COD handling fee
  },
  slaScore: { type: Number, default: 80, min: 0, max: 100 }, // reliability score
  deliverySuccessRate: { type: Number, default: 95, min: 0, max: 100 }, // % of successful deliveries
  speed: {
    type: String,
    enum: ['Standard', 'Express', 'Same-Day'],
    default: 'Standard'
  },
  avgDeliveryDays: { type: Number, default: 3 },
  cutoffTime: { type: String, default: '18:00' },  // HH:MM — after this no new bookings
  branchAvailability: [String],                     // cities where branches exist
  capacityLimit: { type: Number, default: 500 },   // max parcels per day
  currentLoad: { type: Number, default: 0 },        // today's assigned parcel count
  lastLoadResetDate: { type: Date, default: Date.now },

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Partner', partnerSchema);

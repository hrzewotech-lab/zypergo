const mongoose = require('mongoose');

const serviceabilityRuleSchema = new mongoose.Schema({
  ruleType: {
    type: String,
    enum: [
      'PincodeBlock', 
      'CityBlock', 
      'RouteBlock', 
      'CategoryBlock', 
      'ProhibitedItem', 
      'GlobalConstraint', 
      'TemporaryBlock', 
      'PaymentModeBlock', 
      'Holiday',
      'CutoffTimeRule',
      'FragileRule'
    ],
    required: true
  },
  
  // Location specific blocks
  originPincode: String,
  destPincode: String,
  city: String, // can be used for either origin or dest city block

  // Item specific blocks
  category: String, // e.g., 'Fragile Item', 'Commercial Package', 'Fertilizers'
  keyword: String, // e.g., 'lithium battery', 'liquid', 'acid', 'fireworks', 'poison'

  // Global & Weight/Volume Constraints
  maxWeight: Number, // in kg
  maxVolumetricWeight: Number, // in kg
  maxVolume: Number, // in cm3 (L * W * H)
  maxFragileWeight: Number, // max kg allowed if parcel is marked fragile

  // Temporal Blocks & Operational Rules (Temporary blocks / Holidays / Cutoffs)
  startDate: Date,
  endDate: Date,
  cutoffTime: String, // '18:00'
  blockReason: {
    type: String,
    enum: ['Weather', 'Strike', 'Partner Issue', 'Hub Overload', 'Festival Delay', 'Maintenance', 'Other']
  },

  // Payment Mode Rules
  paymentMode: {
    type: String,
    enum: ['UPI', 'Card', 'NetBanking', 'Wallet', 'Cash']
  },
  maxCodValue: Number, // max amount allowed for COD in INR

  // Customer facing message
  reason: {
    type: String,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ServiceabilityRule', serviceabilityRuleSchema);

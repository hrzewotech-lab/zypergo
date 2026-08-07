const mongoose = require('mongoose');

const serviceabilityRuleSchema = new mongoose.Schema({
  ruleType: {
    type: String,
    enum: ['PincodeBlock', 'CityBlock', 'RouteBlock', 'CategoryBlock', 'ProhibitedItem', 'GlobalConstraint'],
    required: true
  },
  
  // Location specific blocks
  originPincode: String,
  destPincode: String,
  city: String, // can be used for either origin or dest city block

  // Item specific blocks
  category: String, // e.g., 'Fragile Item'
  keyword: String, // e.g., 'lithium battery', 'liquid', 'acid'

  // Global Constraints
  maxWeight: Number, // in kg
  maxVolume: Number, // in cm3 (L * W * H)

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

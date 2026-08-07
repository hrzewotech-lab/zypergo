const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema({
  ruleName: { type: String, required: true },
  ruleType: {
    type: String,
    enum: ['Base', 'Slab', 'Route', 'Pincode', 'Surcharge'],
    required: true
  },
  movementType: {
    type: String,
    enum: ['Intracity', 'Intercity', 'Any'],
    default: 'Any'
  },
  speed: {
    type: String,
    enum: ['Standard', 'Express', 'Any'],
    default: 'Any'
  },
  
  // Conditionally applied if these match
  conditions: {
    originCity: { type: String },
    destCity: { type: String },
    originPincode: { type: String },
    destPincode: { type: String },
    category: { type: String }, // e.g., 'Fragile Item'
    minWeight: { type: Number, default: 0 },
    maxWeight: { type: Number }
  },

  // The actual pricing values applied
  rates: {
    basePrice: { type: Number, default: 0 },
    perKgRate: { type: Number, default: 0 },
    perKmRate: { type: Number, default: 0 },
    handlingFee: { type: Number, default: 0 },
    gstPercentage: { type: Number, default: 18 },
    insurancePercentage: { type: Number, default: 0 } // e.g., 2% of parcel value
  },

  // For Surcharges (e.g. Fragile, Express) -> add to base
  // For Base/Slab -> replace base
  isSurcharge: { type: Boolean, default: false },

  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PricingRule', pricingRuleSchema);

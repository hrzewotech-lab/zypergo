const mongoose = require('mongoose');

const routingRuleSchema = new mongoose.Schema({
  originPincode: { type: String, required: true },
  destPincode: { type: String, required: true },
  isAllowed: { type: Boolean, default: true },
  overrideDeliveryType: { 
    type: String, 
    enum: ['Local Direct', 'Local Transshipment', 'Intercity Hub-and-Spoke', null],
    default: null 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Create a compound index for fast lookups
routingRuleSchema.index({ originPincode: 1, destPincode: 1 }, { unique: true });

module.exports = mongoose.model('RoutingRule', routingRuleSchema);

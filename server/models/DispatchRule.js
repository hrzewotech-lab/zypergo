const mongoose = require('mongoose');

const dispatchRuleSchema = new mongoose.Schema({
  name: { type: String, default: 'Default Rule Set' },
  isActive: { type: Boolean, default: true },

  // --- Rider Scoring Weights (must total 100 for pickup, 100 for lastmile) ---
  pickupWeights: {
    distanceScore: { type: Number, default: 40 },   // nearness to pickup
    loadScore: { type: Number, default: 25 },         // how free the rider is
    vehicleScore: { type: Number, default: 20 },      // vehicle suitability
    performanceScore: { type: Number, default: 15 }   // historical punctuality
  },
  lastMileWeights: {
    hubMatch: { type: Number, default: 30 },          // assigned to correct dest hub
    clusterScore: { type: Number, default: 30 },      // same area deliveries
    availabilityScore: { type: Number, default: 25 }, // not overloaded
    slaScore: { type: Number, default: 15 }           // SLA compliance history
  },

  // --- Partner Scoring Weights ---
  partnerWeights: {
    rateScore: { type: Number, default: 30 },
    speedScore: { type: Number, default: 30 },
    slaScore: { type: Number, default: 25 },
    successRateScore: { type: Number, default: 15 }
  },

  // --- Guard Rails ---
  maxTasksPerRider: { type: Number, default: 20 },          // per shift
  maxKmFromPickup: { type: Number, default: 10 },            // km radius
  enforceCutoffTime: { type: Boolean, default: true },
  enforceCapacityLimit: { type: Boolean, default: true },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('DispatchRule', dispatchRuleSchema);

const mongoose = require('mongoose');

const analyticsSnapshotSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    unique: true
  },
  metrics: {
    totalBookings: { type: Number, default: 0 },
    successfulDeliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    returns: { type: Number, default: 0 },
    
    totalRevenue: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    
    slaBreaches: { type: Number, default: 0 },
    activeRoutes: { type: Number, default: 0 }
  },
  // Forecasting-ready structure (e.g., breakdown by pin/category)
  breakdown: {
    byCategory: { type: Map, of: Number }, // e.g. { 'Electronics': 50, 'Clothes': 120 }
    byCity: { type: Map, of: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);

const mongoose = require('mongoose');

const hubRecordSchema = new mongoose.Schema({
  hubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  trackingId: { type: String, required: true },
  recordType: {
    type: String,
    enum: ['Inbound From Rider', 'Outbound To Hub', 'Inbound From Hub', 'Outbound To Rider', 'Other'],
    required: true
  },
  actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Rider or Staff
  customerDetails: {
    name: String,
    phone: String
  },
  destination: {
    address: String,
    pincode: String
  },
  associatedHub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' }, // For transfer to/from other hub
  modeOfTransfer: { type: String }, // e.g., 'Truck', 'Van' (from manifest or manually entered)
  timestamp: { type: Date, default: Date.now },
  notes: { type: String }
}, { timestamps: true });

// Add indexing for faster querying by hub
hubRecordSchema.index({ hubId: 1, timestamp: -1 });
hubRecordSchema.index({ trackingId: 1 });

module.exports = mongoose.model('HubRecord', hubRecordSchema);

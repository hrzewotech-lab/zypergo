const mongoose = require('mongoose');

const scanEventSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  trackingId: {
    type: String,
    required: true,
    index: true
  },
  scanType: {
    type: String,
    required: true,
    enum: [
      'Pickup',
      'SourceHubReceive',
      'Sort',
      'PartnerHandover',
      'PartnerAccept',
      'DestinationHubReceive',
      'OutForDelivery',
      'Delivered',
      'Return'
    ]
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  hubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hub'
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
  },
  deviceId: { type: String, default: 'Web' },
  gps: {
    lat: { type: Number },
    lng: { type: Number }
  },
  parcelCondition: {
    type: String,
    enum: ['Good', 'Damaged', 'Tampered', 'Wet'],
    default: 'Good'
  },
  notes: { type: String },
  // Anomaly flags
  isDuplicate: { type: Boolean, default: false },
  isMismatch: { type: Boolean, default: false },
  mismatchReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ScanEvent', scanEventSchema);

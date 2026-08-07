const mongoose = require('mongoose');

const parcelItemSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  trackingId: { type: String },
  weight: { type: Number, default: 0 },
  scanned: { type: Boolean, default: false }
}, { _id: false });

const manifestSchema = new mongoose.Schema({
  manifestId: { type: String, required: true, unique: true },
  manifestType: {
    type: String,
    enum: [
      'Pickup',
      'HubReceiving',
      'PartnerHandover',
      'IntercityTransport',
      'DestinationReceiving',
      'LastMileDelivery',
      'Return'
    ],
    required: true
  },
  // Legacy type field kept for compatibility
  type: {
    type: String,
    enum: ['Bag', 'Bundle', 'Consignment', 'Partner Manifest'],
    default: 'Bag'
  },
  sourceHub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' },
  destinationHub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' },
  assignedPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
  route: { type: String },
  parcels: [parcelItemSchema],
  parcelCount: { type: Number, default: 0 },
  totalWeight: { type: Number, default: 0 }, // in kg
  status: {
    type: String,
    enum: ['Created', 'Sealed', 'Dispatched', 'In Transit', 'Received', 'Completed'],
    default: 'Created'
  },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  digitalSignature: { type: String }, // base64 or URL
  sealedAt: { type: Date },
  dispatchedAt: { type: Date },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Manifest', manifestSchema);

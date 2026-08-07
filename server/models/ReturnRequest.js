const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  reason: {
    type: String,
    enum: [
      'Receiver Refused',
      'Max Attempts Reached',
      'Wrong Address',
      'Damaged',
      'Sender Recall',
      'Customer Requested'
    ],
    required: true
  },
  status: {
    type: String,
    enum: [
      'Return Initiated',
      'Approved',
      'Route Assigned',
      'Destination Hub Reverse Scan',
      'Partner Reverse Handover',
      'Source Hub Received',
      'Out for Return',
      'Returned to Sender',
      'Rejected'
    ],
    default: 'Return Initiated'
  },
  notes: {
    type: String // Extra context (e.g. description of damage)
  },
  
  // Financials
  returnCharges: {
    type: Number,
    default: 0
  },
  refundAdjustment: {
    type: Number,
    default: 0
  },

  // Logistics tracking specific to the return
  proofOfReturn: {
    signatureUrl: String,
    photoUrl: String,
    gps: {
      lat: Number,
      lng: Number
    },
    timestamp: Date
  },

  // Audit
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);

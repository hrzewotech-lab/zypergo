const mongoose = require('mongoose');

const exceptionNdrSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  type: {
    type: String,
    enum: ['Pickup Exception', 'Delivery NDR', 'Partner Exception'],
    required: true
  },
  reason: {
    type: String,
    required: true
    // e.g. Receiver Unavailable, Door Locked, Parcel Damaged, Lost Parcel, Wrong Address
  },
  status: {
    type: String,
    enum: ['Open', 'Action Required', 'Resolved', 'Closed'],
    default: 'Open'
  },
  evidence: {
    photoUrl: String,
    notes: String,
    gps: {
      lat: Number,
      lng: Number
    }
  },
  resolution: {
    action: {
      type: String,
      enum: ['Reattempt', 'Reschedule', 'Address Update', 'Return to Sender', 'Refund', 'Damage Claim', 'None']
    },
    notes: String,
    resolvedAt: Date
  },
  reattemptCount: {
    type: Number,
    default: 0
  },
  raisedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' // the rider or partner 
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Ops Admin or Support Executive handling it
  }
}, { timestamps: true });

module.exports = mongoose.model('ExceptionNDR', exceptionNdrSchema);

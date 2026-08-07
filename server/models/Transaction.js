const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  type: {
    type: String,
    enum: ['Payment', 'Refund', 'Cancellation Charge'],
    required: true
  },
  method: {
    type: String,
    enum: ['Online', 'Cash (Sender)', 'Cash (Receiver)'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  gstAmount: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Processing'],
    default: 'Pending'
  },
  referenceId: {
    type: String // Payment gateway transaction ID
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);

const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: ['Rider', 'Partner'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityTypeModel', // Dynamic reference (User or Partner)
    required: true
  },
  entityTypeModel: {
    type: String,
    enum: ['User', 'Partner'],
    required: true
  },
  type: {
    type: String,
    enum: ['Cash Deposit', 'Payout', 'Penalty', 'Deduction'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Settled', 'Disputed'],
    default: 'Pending'
  },
  mismatchAlert: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin or Hub Manager who processed this
  }
}, { timestamps: true });

module.exports = mongoose.model('Settlement', settlementSchema);

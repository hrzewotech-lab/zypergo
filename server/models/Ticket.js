const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Mocking auth
  },
  issueType: {
    type: String,
    enum: ['Pickup Issue', 'Delivery Delay', 'Damaged Parcel', 'Lost Parcel', 'Payment Issue', 'Refund', 'Wrong Address', 'Return Request', 'Rider Behavior', 'Partner Delay', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  slaTimer: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: { type: Date, default: Date.now }
  }],
  attachments: [{ type: String }],
  history: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    performedBy: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);

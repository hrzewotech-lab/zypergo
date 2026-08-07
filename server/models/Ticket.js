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
    enum: ['Pickup Issue', 'Delivery Delay', 'Damaged Parcel', 'Lost Parcel', 'Payment Issue', 'Refund', 'Wrong Address', 'Return Request', 'Other'],
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
  history: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    performedBy: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String, // e.g., 'Booking', 'Partner', 'User'
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId // Optional, specific ID of the resource affected
  },
  details: {
    type: mongoose.Schema.Types.Mixed // JSON object with details of the change
  },
  ipAddress: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);

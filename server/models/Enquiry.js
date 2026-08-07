const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Partner', 'Rider', 'Business', 'General'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Resolved'],
    default: 'New'
  },
  details: {
    // For specific form fields like city for riders, company name for business, etc.
    type: mongoose.Schema.Types.Mixed 
  }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);

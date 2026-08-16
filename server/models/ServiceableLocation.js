const mongoose = require('mongoose');

const serviceableLocationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  state: {
    type: String,
    trim: true,
    default: ''
  },
  areaName: {
    type: String,
    trim: true,
    default: ''
  },
  zone: {
    type: String,
    enum: ['North', 'South', 'East', 'West', 'Central', 'North-East', 'General'],
    default: 'General'
  },
  locationType: {
    type: String,
    enum: ['City', 'Pincode'],
    default: 'Pincode'
  },
  value: {
    type: String,
    trim: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  pickupAvailable: {
    type: Boolean,
    default: true
  },
  deliveryAvailable: {
    type: Boolean,
    default: true
  },
  expressAvailable: {
    type: Boolean,
    default: true
  },
  codAvailable: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Pre-save hook to ensure value matches pincode
serviceableLocationSchema.pre('save', function() {
  if (!this.value && this.pincode) {
    this.value = this.pincode;
  }
});

module.exports = mongoose.model('ServiceableLocation', serviceableLocationSchema);

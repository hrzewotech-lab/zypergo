const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hubType: {
    type: String,
    enum: ['Source', 'Destination', 'City'],
    required: true
  },
  address: {
    line1: String,
    city: String,
    state: String,
    pincode: String,
    lat: Number,
    lng: Number
  },
  servicePincodes: [String],
  capacity: {
    currentParcels: { type: Number, default: 0 },
    maxCapacity: { type: Number, required: true }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Hub', hubSchema);

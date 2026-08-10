const mongoose = require('mongoose');

const vehicleConfigSchema = new mongoose.Schema({
  vehicleType: { 
    type: String, 
    enum: ['Bike', 'Auto/Three-Wheeler', 'Mini Truck', 'Heavy Vehicle'],
    required: true,
    unique: true
  },
  maxWeight: { type: Number, required: true }, // in kg
  maxVolume: { type: Number }, // in cubic cm (length * width * height)
  isActive: { type: Boolean, default: true },
  configuredBy: { type: String, default: 'Super Admin' } // For tracking who modified it
}, { timestamps: true });

module.exports = mongoose.model('VehicleConfig', vehicleConfigSchema);

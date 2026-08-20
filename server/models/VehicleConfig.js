const mongoose = require('mongoose');

const vehicleConfigSchema = new mongoose.Schema({
  vehicleType: { 
    type: String, 
    enum: ['Scooter', 'Mini 3W', '3 Wheeler', 'Tata Ace', 'Pickup 8ft', 'Pickup 9ft', '14ft', '17ft'],
    required: true,
    unique: true
  },
  maxWeight: { type: Number, required: true }, // in kg
  maxVolume: { type: Number }, // in cubic cm (length * width * height)
  isActive: { type: Boolean, default: true },
  configuredBy: { type: String, default: 'Super Admin' } // For tracking who modified it
}, { timestamps: true });

module.exports = mongoose.model('VehicleConfig', vehicleConfigSchema);

const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hubType: {
    type: String,
    default: 'City'
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
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' }
  },
  staffRoles: [{ type: String }],
  holidayCalendar: [{ type: Date }],
  contactDetails: {
    phone: String,
    email: String,
    managerName: String
  },
  capacity: {
    currentParcels: { type: Number, default: 0 },
    maxCapacity: { type: Number, required: true },
    capacityThresholdAlert: { type: Number, default: 90 } // Percentage
  },
  assignedRiders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedPartners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Partner' }],
  assignedRoutes: [{ type: String }], // Mocking Route as String for now
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Hub', hubSchema);

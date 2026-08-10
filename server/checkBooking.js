const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zypergo')
  .then(async () => {
    try {
      const booking = await Booking.findOne({ trackingId: 'ZYP17714336' })
        .populate('sender')
        .populate('trackingHistory.scannedBy');
      
      if (!booking) {
        console.log('Booking not found');
        process.exit(0);
      }
      console.log('Booking ID:', booking._id);
      console.log('Status:', booking.status);
      console.log('Sender ID:', booking.sender?._id);
      console.log('Sender Phone:', booking.sender?.phone);
      console.log('Sender Email:', booking.sender?.email);
      
      // Let's also check if it's assigned to any raider via trackingHistory
      const assignedLog = booking.trackingHistory.find(h => h.status === 'Rider Assigned');
      if (assignedLog && assignedLog.scannedBy) {
        console.log('Assigned Raider ID:', assignedLog.scannedBy._id);
        console.log('Assigned Raider Phone:', assignedLog.scannedBy.phone);
      } else {
        console.log('No specific raider assignment log found in tracking history.');
      }
      
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('DB Connection error:', err);
    process.exit(1);
  });

const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const HubRecord = require('./models/HubRecord');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zypergo').then(async () => {
  const records = await HubRecord.find();
  
  let count = 0;
  for (const record of records) {
    if (record.bookingId) {
      const booking = await Booking.findById(record.bookingId);
      if (booking) {
        let dropOffRaider = null;
        if (booking.assignedRaiders && booking.assignedRaiders.length > 0) {
          dropOffRaider = booking.assignedRaiders[booking.assignedRaiders.length - 1].raiderId;
        }

        record.customerDetails = {
          name: booking.receiver?.name,
          phone: booking.receiver?.phone
        };
        record.destination = {
          address: booking.dropLocation?.address,
          pincode: booking.dropLocation?.pincode
        };
        if (!record.actionBy && dropOffRaider) {
          record.actionBy = dropOffRaider;
        }
        await record.save();
        count++;
      }
    }
  }

  console.log(`Updated ${count} HubRecords`);
  process.exit(0);
}).catch(console.error);

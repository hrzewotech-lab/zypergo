const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Hub = require('./models/Hub');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zypergo').then(async () => {
  const hubs = await Hub.find();
  if(hubs.length === 0) {
    console.log('No hubs found');
    process.exit(0);
  }
  const sourceHubId = hubs[0]._id;
  const res = await Booking.updateMany(
    { 'metadata.deliveryType': 'Intercity Hub-and-Spoke', 'metadata.sourceHub': { $exists: false } },
    { $set: { 'metadata.sourceHub': sourceHubId, 'metadata.destinationHub': hubs.length > 1 ? hubs[1]._id : sourceHubId } }
  );
  
  const res2 = await Booking.updateMany(
    { 'metadata.deliveryType': 'Intercity Hub-and-Spoke', 'metadata.sourceHub': null },
    { $set: { 'metadata.sourceHub': sourceHubId, 'metadata.destinationHub': hubs.length > 1 ? hubs[1]._id : sourceHubId } }
  );
  console.log('Updated bookings:', res.modifiedCount + res2.modifiedCount);
  process.exit(0);
}).catch(console.error);

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://hrzewotech:zewotech@zewo.yo2htvx.mongodb.net/zypergo').then(async () => {
  const Booking = require('./models/Booking');
  let query = { status: { $in: ['Booking Confirmed', 'Pending', 'Relay Handoff Pending', 'Transhipment Pending'] } };
  query['metadata.vehicleType'] = 'Bike';
  const availableJobs = await Booking.find(query).sort({ createdAt: -1 });
  console.log('Available Jobs for Bike:', availableJobs.length);
  availableJobs.forEach(b => console.log(b._id, b.metadata.vehicleType, b.status));
  process.exit(0);
});

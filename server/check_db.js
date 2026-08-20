const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://hrzewotech:zewotech@zewo.yo2htvx.mongodb.net/zypergo').then(async () => {
  const Booking = require('./models/Booking');
  const User = require('./models/User');
  const b = await Booking.findOne({ 'packageDetails.weight': 50 }).sort({createdAt: -1});
  console.log('Booking metadata:', b?.metadata);
  const u = await User.findOne({ role: 'Rider', 'riderDetails.vehicleType': 'Bike' });
  console.log('Rider Bike:', u?.riderDetails?.vehicleType);
  
  const u2 = await User.find({ role: 'Rider' }).select('riderDetails.vehicleType name');
  console.log('All Riders:', u2);
  process.exit(0);
});

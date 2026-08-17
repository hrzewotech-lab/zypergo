const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://hrzewotech:zewotech@zewo.yo2htvx.mongodb.net/zypergo').then(async () => {
  const Booking = require('./models/Booking');
  const User = require('./models/User');
  const b = await Booking.findOne({ 'packageDetails.weight': 50 }).sort({createdAt: -1});
  console.log('Booking metadata:', b?.metadata);
  const u = await User.findOne({ role: 'Raider', 'raiderDetails.vehicleType': 'Bike' });
  console.log('Raider Bike:', u?.raiderDetails?.vehicleType);
  
  const u2 = await User.find({ role: 'Raider' }).select('raiderDetails.vehicleType name');
  console.log('All Raiders:', u2);
  process.exit(0);
});

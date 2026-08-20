const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/zypergo').then(async () => {
  const Booking = require('./server/models/Booking');
  const User = require('./server/models/User');
  const b = await Booking.findOne({ 'packageDetails.weight': 50 }).sort({createdAt: -1});
  console.log('Booking vehicleType:', b?.metadata?.vehicleType);
  const u = await User.findOne({ role: 'Rider' });
  console.log('Rider vehicleType:', u?.riderDetails?.vehicleType);
  process.exit(0);
});

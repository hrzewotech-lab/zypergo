require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = 'ramarajukoyyalagadda@gmail.com';
  const phone = undefined;
  const role = 'Customer';
  
  console.log("Querying...");
  let user = await User.findOne({ $or: [{ email }, { phone }], role });
  console.log("Found user:", user ? (user.email + ", " + user.phone) : "null");
  
  if (user && user.email) {
    console.log("Would call sendEmail to", user.email);
  } else {
    console.log("Would call sendSMS to", user?.phone);
  }
  process.exit();
}
test();

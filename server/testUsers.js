require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  console.log("Recent Users:");
  const users = await User.find().sort({ createdAt: -1 }).limit(5);
  users.forEach(u => {
    console.log(`- Name: ${u.name}, Email: ${u.email}, Phone: ${u.phone}, CreatedAt: ${u.createdAt}`);
  });
  
  process.exit();
}
test();

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zypergo', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@zypergo.com';
    
    // Check if superadmin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('SuperAdmin already exists with email:', adminEmail);
      process.exit(0);
    }

    const superAdmin = new User({
      role: 'SuperAdmin',
      name: 'System Administrator',
      email: adminEmail,
      phone: '+919999999999',
      password: 'AdminPassword123!', // This will be hashed automatically by the pre-save hook in User model
      isActive: true,
      kycVerified: true
    });

    await superAdmin.save();
    console.log('Successfully seeded SuperAdmin user:');
    console.log('Email:', adminEmail);
    console.log('Password: AdminPassword123!');
    console.log('Phone:', '+919999999999');

  } catch (error) {
    console.error('Error seeding SuperAdmin:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedSuperAdmin();

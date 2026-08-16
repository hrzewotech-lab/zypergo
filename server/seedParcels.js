const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');
const User = require('./models/User');

const seedParcels = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zypergo');
    console.log('Connected to MongoDB');

    // Create a mock customer if one doesn't exist
    let customer = await User.findOne({ role: 'Customer' });
    if (!customer) {
      customer = new User({
        name: 'Seed Customer',
        phone: '8888888888',
        email: 'customer@zypergo.com',
        password: 'password',
        role: 'Customer',
        isActive: true
      });
      await customer.save();
      console.log('Created Seed Customer');
    }

    // Create 3 bookings ready for pickup
    const bookingsToSeed = [
      {
        sender: customer._id,
        trackingId: 'ZGO-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        status: 'Booking Confirmed', // Visible to nearby raiders
        pickupLocation: {
          address: '123 Seed Street, Madhapur',
          pincode: '500081',
          lat: 17.4401,
          lng: 78.3489
        },
        dropLocation: {
          address: '456 Drop Ave, Jubilee Hills',
          pincode: '500033',
          lat: 17.4300,
          lng: 78.4000
        },
        receiver: {
          name: 'Jane Receiver',
          phone: '7777777777'
        },
        packageDetails: {
          category: 'General Parcel',
          weight: 2.5,
          value: 1000,
          prohibitedDeclared: true
        },
        payment: {
          mode: 'UPI',
          status: 'Pending',
          payer: 'Receiver'
        },
        pricing: {
          total: 150
        }
      },
      {
        sender: customer._id,
        trackingId: 'ZGO-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        status: 'Booking Confirmed', 
        pickupLocation: {
          address: '789 Tech Park, Gachibowli',
          pincode: '500032',
          lat: 17.4401,
          lng: 78.3489
        },
        dropLocation: {
          address: '101 Cyber Tower, Hitech City',
          pincode: '500081',
          lat: 17.4500,
          lng: 78.3800
        },
        receiver: {
          name: 'Tech Corp',
          phone: '7777777776'
        },
        packageDetails: {
          category: 'Document',
          weight: 0.5,
          value: 0,
          prohibitedDeclared: true
        },
        payment: {
          mode: 'UPI',
          status: 'Completed',
          payer: 'Sender'
        },
        pricing: {
          total: 50
        }
      }
    ];

    await Booking.insertMany(bookingsToSeed);
    console.log(`Successfully seeded ${bookingsToSeed.length} bookings for raiders to pick up.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding parcels:', error);
    process.exit(1);
  }
};

seedParcels();

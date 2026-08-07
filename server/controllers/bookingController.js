const Booking = require('../models/Booking');

// Calculate distance based on pincode difference (Mock implementation)
const calculateMockDistance = (pin1, pin2) => {
  // If pincodes are same, it's very local. If different, we mock a distance based on the absolute difference.
  if (pin1 === pin2) return 10;
  const diff = Math.abs(parseInt(pin1) - parseInt(pin2));
  return Math.min(diff, 1500); // cap at 1500km
};

exports.createBooking = async (req, res) => {
  try {
    const bookingData = req.body;

    const pickupPin = bookingData.pickupLocation.pincode;
    const dropPin = bookingData.dropLocation.pincode;
    
    // Admin Allow List check (Mock: reject 000000)
    if (pickupPin === '000000' || dropPin === '000000') {
      return res.status(400).json({ success: false, error: 'Service is not available in these postcodes.' });
    }

    const distance = calculateMockDistance(pickupPin, dropPin);

    // Delivery Type Routing
    let deliveryType = 'Intercity Hub-and-Spoke';
    if (distance <= 10) deliveryType = 'Local Direct';
    else if (distance <= 65) deliveryType = 'Local Transshipment';
    
    const isIntracity = deliveryType !== 'Intercity Hub-and-Spoke';
    
    // Vehicle Auto-Suggestion based on weight
    const actualWeight = bookingData.packageDetails.weight || 0;
    let vehicleType = 'Heavy Vehicle';
    if (actualWeight < 20) vehicleType = 'Bike';
    else if (actualWeight < 500) vehicleType = 'Auto/Three-Wheeler';
    else if (actualWeight < 2000) vehicleType = 'Mini Truck';

    bookingData.metadata = { 
      intracity: isIntracity,
      deliveryType,
      vehicleType
    };

    // Pricing Calculation (Mock logic)
    let baseCharge = isIntracity ? 50 : 200;
    
    let volumetricWeight = 0;
    if (bookingData.packageDetails.dimensions && bookingData.packageDetails.dimensions.length) {
      const { length, width, height } = bookingData.packageDetails.dimensions;
      volumetricWeight = (length * width * height) / 5000;
    }
    
    const chargeableWeight = Math.max(actualWeight, volumetricWeight);
    const distanceCharge = distance * (isIntracity ? 10 : 3);
    const weightCharge = chargeableWeight * 15;
    
    let speedModifier = 1;
    if (bookingData.preferences && bookingData.preferences.speed === 'Express') {
      speedModifier = 1.5;
    }

    const totalBeforeSpeed = baseCharge + distanceCharge + weightCharge;
    const total = Math.round(totalBeforeSpeed * speedModifier);

    bookingData.pricing = {
      base: baseCharge,
      distance: distanceCharge,
      weight: weightCharge,
      volumetric: volumetricWeight,
      total: total
    };

    // Tracking & Confirmation Rules
    // Generate Unique Tracking ID
    const trackingId = 'ZYP' + Math.random().toString().slice(2, 10);
    bookingData.trackingId = trackingId;
    bookingData.status = 'Booking Confirmed';

    // Mock ETA calculation
    const today = new Date();
    if (isIntracity) {
      if (bookingData.preferences?.speed === 'Express') {
        bookingData.eta = 'Expected Today by 8 PM';
      } else {
        bookingData.eta = 'Expected Tomorrow';
      }
    } else {
      bookingData.eta = `Expected in ${Math.ceil(distance / 500)} days`;
    }

    bookingData.trackingHistory = [
      { status: 'Booking Confirmed', location: 'System', description: 'Booking received and verified.' }
    ];

    const booking = new Booking(bookingData);
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to create booking', details: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    // In a real app, we'd filter by req.user._id (from auth middleware)
    // For now, since auth is mocked, we'll just return recent bookings
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(20);
    
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
};

exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch booking details' });
  }
};

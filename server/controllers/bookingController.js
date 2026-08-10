const Booking = require('../models/Booking');
const RoutingRule = require('../models/RoutingRule');
const VehicleConfig = require('../models/VehicleConfig');

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
    
    // Check Allow List and Routing Overrides
    const routingRule = await RoutingRule.findOne({ originPincode: pickupPin, destPincode: dropPin });
    
    // If no rule exists or is explicitly not allowed
    if (!routingRule || !routingRule.isAllowed) {
      return res.status(400).json({ 
        success: false, 
        error: `Service is not available between postcodes ${pickupPin} and ${dropPin}.` 
      });
    }

    const distance = calculateMockDistance(pickupPin, dropPin);

    // Delivery Type Routing
    let deliveryType = 'Intercity Hub-and-Spoke';
    
    // Apply Admin Override if present
    if (routingRule.overrideDeliveryType) {
      deliveryType = routingRule.overrideDeliveryType;
    } else {
      // Default Distance Rules
      if (distance <= 10) deliveryType = 'Local Direct';
      else if (distance <= 65) deliveryType = 'Local Transshipment';
    }
    
    const isIntracity = deliveryType !== 'Intercity Hub-and-Spoke';
    
    // Vehicle Auto-Suggestion based on Configs
    const actualWeight = bookingData.packageDetails.weight || 0;
    const volWeight = bookingData.packageDetails.dimensions ? 
      (bookingData.packageDetails.dimensions.length * bookingData.packageDetails.dimensions.width * bookingData.packageDetails.dimensions.height) / 5000 : 0;
    
    // Fallback defaults
    let vehicleType = 'Heavy Vehicle';
    
    // Fetch configs sorted by maxWeight ascending to find the smallest suitable vehicle
    const vehicleConfigs = await VehicleConfig.find({ isActive: true }).sort({ maxWeight: 1 });
    
    if (vehicleConfigs.length > 0) {
      // Find the first vehicle that can handle BOTH actual and volumetric weight (or just use actual)
      const suitableVehicle = vehicleConfigs.find(v => v.maxWeight >= Math.max(actualWeight, volWeight));
      if (suitableVehicle) {
        vehicleType = suitableVehicle.vehicleType;
      } else {
        // If it exceeds all, pick the largest (which is the last one in the sorted list)
        vehicleType = vehicleConfigs[vehicleConfigs.length - 1].vehicleType;
      }
    } else {
      // Hardcoded fallback if DB is empty
      if (actualWeight < 20) vehicleType = 'Bike';
      else if (actualWeight < 500) vehicleType = 'Auto/Three-Wheeler';
      else if (actualWeight < 2000) vehicleType = 'Mini Truck';
    }

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

    // Mock Notifications
    console.log(`[SMS] To Sender (${bookingData.senderDetails?.phone || 'Guest'}): Booking ${trackingId} confirmed.`);
    console.log(`[PUSH] Booking confirmed. Track here: /track?id=${trackingId}`);
    console.log(`[SMS] To Receiver (${bookingData.receiver?.phone}): Expect a package! Tracking ID: ${trackingId}`);

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
    const id = req.params.id;
    let booking;
    
    // Check if it's a tracking ID (ZYP...) or an ObjectId
    if (id.startsWith('ZYP')) {
      booking = await Booking.findOne({ trackingId: id });
    } else {
      booking = await Booking.findById(id);
    }
    
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

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, error: 'Booking is already cancelled' });
    }

    // Cancellation logic based on status
    let penalty = 0;
    if (booking.status === 'Pending' || booking.status === 'Booking Confirmed') {
      // Free cancellation
      penalty = 0;
    } else if (booking.status === 'Rider Assigned' || booking.status === 'Rider On the Way') {
      // 20% penalty if a rider is already assigned
      penalty = booking.pricing?.total ? booking.pricing.total * 0.20 : 0;
    } else {
      // No cancellation permitted once picked up
      return res.status(400).json({ success: false, error: 'Cancellation not permitted at this stage.' });
    }

    booking.status = 'Cancelled';
    booking.trackingHistory.push({
      status: 'Cancelled',
      location: 'System',
      description: penalty > 0 ? `Cancelled with penalty of ₹${penalty}` : 'Cancelled by customer'
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: penalty > 0 ? `Booking cancelled. A cancellation fee of ₹${penalty} applies.` : 'Booking cancelled successfully.',
      data: booking
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel booking' });
  }
};

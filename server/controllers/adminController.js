const Booking = require('../models/Booking');
const Partner = require('../models/Partner');

// --- Dashboard KPIs ---
exports.getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const inTransit = await Booking.countDocuments({ status: { $in: ['In Transit', 'Out for Delivery'] } });
    const pendingPickups = await Booking.countDocuments({ status: 'Booking Confirmed' });
    const exceptions = await Booking.countDocuments({ status: { $in: ['Delayed', 'Failed', 'Returned'] } });

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        inTransit,
        pendingPickups,
        exceptions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

// --- Booking Management ---
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('metadata.sourceHub', 'name')
      .populate('metadata.assignedPartner', 'companyName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
};

exports.updateBookingAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // e.g., { status, assignedPartner }

    const booking = await Booking.findByIdAndUpdate(id, updates, { new: true });
    
    if (updates.status) {
       booking.trackingHistory.push({
         status: updates.status,
         description: 'Updated by Admin manually.'
       });
       await booking.save();
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
};

// --- Partner Management ---
exports.getPartners = async (req, res) => {
  try {
    const partners = await Partner.find();
    res.status(200).json({ success: true, data: partners });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch partners' });
  }
};

exports.createPartner = async (req, res) => {
  try {
    const partner = new Partner(req.body);
    await partner.save();
    res.status(201).json({ success: true, data: partner });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create partner' });
  }
};

exports.sendBroadcast = async (req, res) => {
  try {
    const { title, body, target } = req.body;
    // Mock FCM push notification blast
    console.log(`[FCM Broadcast]: ${title} - ${body} (Target: ${target})`);
    res.status(200).json({ success: true, message: 'Broadcast sent via FCM' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send broadcast' });
  }
};

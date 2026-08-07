const Booking = require('../models/Booking');
const Partner = require('../models/Partner');
const User = require('../models/User');

// --- Dashboard KPIs ---
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalBookings = await Booking.countDocuments();
    const todaysBookings = await Booking.countDocuments({ createdAt: { $gte: today } });
    
    const inTransit = await Booking.countDocuments({ status: { $in: ['In Transit', 'Out for Delivery', 'Rider On the Way'] } });
    const pendingPickups = await Booking.countDocuments({ status: { $in: ['Pending', 'Booking Confirmed', 'Rider Assigned'] } });
    const delivered = await Booking.countDocuments({ status: 'Delivered' });
    const failed = await Booking.countDocuments({ status: 'Failed' });
    const returns = await Booking.countDocuments({ status: 'Returned' });
    const exceptions = await Booking.countDocuments({ status: { $in: ['Delayed', 'Failed', 'Returned', 'Cancelled'] } });

    // Financial Aggregation
    const financialStats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.total' },
          cashCollection: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$payment.mode', 'Cash'] }, { $eq: ['$status', 'Delivered'] }] },
                '$pricing.total',
                0
              ]
            }
          }
        }
      }
    ]);

    const revenue = financialStats.length > 0 ? financialStats[0].totalRevenue : 0;
    const cashCollection = financialStats.length > 0 ? financialStats[0].cashCollection : 0;

    // Hub-wise Aggregation (using sourceHub)
    const hubWiseParcels = await Booking.aggregate([
      { $match: { "metadata.sourceHub": { $exists: true, $ne: null } } },
      { $group: { _id: "$metadata.sourceHub", count: { $sum: 1 } } },
      { $lookup: { from: 'hubs', localField: '_id', foreignField: '_id', as: 'hubInfo' } },
      { $unwind: { path: '$hubInfo', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, count: 1, hubName: { $ifNull: ["$hubInfo.name", "Unknown Hub"] } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        todaysBookings,
        inTransit,
        pendingPickups,
        delivered,
        failed,
        returns,
        exceptions,
        revenue,
        cashCollection,
        hubWiseParcels,
        // Mock Alerts for now
        alerts: {
          delayedRoutes: 2,
          highRisk: 1,
          unscanned: 3,
          partnerExceptions: 0,
          complaints: 1
        }
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
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

// --- Admin Management ---
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this phone already exists' });
    }

    const user = new User({
      name,
      email,
      phone,
      password, // Password will be hashed in the pre-save hook
      role
    });

    await user.save();
    
    // Don't return password
    user.password = undefined;

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
};

const Transaction = require('../models/Transaction');
const Settlement = require('../models/Settlement');
const Booking = require('../models/Booking');
const User = require('../models/User');

// --- CUSTOMER TRANSACTIONS ---
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('booking')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch transactions.' });
  }
};

exports.processRefund = async (req, res) => {
  try {
    const { bookingId, amount, reason } = req.body;
    const tx = await Transaction.create({
      booking: bookingId,
      type: 'Refund',
      method: 'Online',
      amount,
      netAmount: amount,
      status: 'Processing',
      notes: reason
    });
    res.status(201).json({ success: true, data: tx });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to process refund.' });
  }
};

// --- RIDER COD TRACKING & DEPOSITS ---
exports.getPendingCOD = async (req, res) => {
  try {
    // Aggregation to find riders holding COD
    const codBookings = await Booking.find({ 
      'payment.mode': 'Cash', 
      'payment.status': 'Completed', 
      'status': 'Delivered' 
    }).populate('assignedRaiders.raiderId');

    // Group by rider
    const pendingCod = {};
    codBookings.forEach(b => {
      // Find the active/delivery rider
      const activeRider = b.assignedRaiders.find(r => r.status === 'Active')?.raiderId;
      if (activeRider) {
        if (!pendingCod[activeRider._id]) {
          pendingCod[activeRider._id] = {
            rider: activeRider,
            expectedAmount: 0,
            bookings: []
          };
        }
        pendingCod[activeRider._id].expectedAmount += b.pricing.total;
        pendingCod[activeRider._id].bookings.push(b.trackingId);
      }
    });

    res.status(200).json({ success: true, data: Object.values(pendingCod) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch pending COD.' });
  }
};

exports.logDeposit = async (req, res) => {
  try {
    const { riderId, amount, expectedAmount, notes } = req.body;
    const mismatchAlert = amount !== expectedAmount;
    
    const settlement = await Settlement.create({
      entityType: 'Rider',
      entityId: riderId,
      entityTypeModel: 'User',
      type: 'Cash Deposit',
      amount,
      status: 'Settled',
      mismatchAlert,
      notes,
      processedBy: req.user?.id
    });

    // Zero out the pending deposit
    await User.findByIdAndUpdate(riderId, {
      $inc: { 'raiderDetails.earnings.pendingDeposit': -amount }
    });

    res.status(201).json({ success: true, data: settlement });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to log deposit.' });
  }
};

// --- SETTLEMENTS & PAYOUTS ---
exports.getSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find()
      .populate('entityId', 'name email companyName')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: settlements });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch settlements.' });
  }
};

exports.logPayout = async (req, res) => {
  try {
    const { partnerId, amount, notes, type } = req.body; // type: Payout, Penalty
    const settlement = await Settlement.create({
      entityType: 'Partner',
      entityId: partnerId,
      entityTypeModel: 'Partner',
      type: type || 'Payout',
      amount,
      status: 'Settled',
      notes,
      processedBy: req.user?.id
    });
    res.status(201).json({ success: true, data: settlement });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to log payout.' });
  }
};

// --- REPORTS ---
exports.getReports = async (req, res) => {
  try {
    // Generate some mock/aggregate data for Daily Closing
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({ createdAt: { $gte: today } });
    const settlements = await Settlement.find({ createdAt: { $gte: today } });

    let onlineRevenue = 0;
    let cashRevenue = 0;
    let refunds = 0;

    transactions.forEach(t => {
      if (t.type === 'Payment' && t.status === 'Completed') {
        if (t.method === 'Online') onlineRevenue += t.amount;
        else cashRevenue += t.amount;
      }
      if (t.type === 'Refund') refunds += t.amount;
    });

    let riderDeposits = 0;
    let partnerPayouts = 0;

    settlements.forEach(s => {
      if (s.type === 'Cash Deposit' && s.status === 'Settled') riderDeposits += s.amount;
      if (s.type === 'Payout' && s.status === 'Settled') partnerPayouts += s.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        dailyClosing: {
          onlineRevenue,
          cashRevenue,
          refunds,
          riderDeposits,
          partnerPayouts,
          netCashInHand: riderDeposits - partnerPayouts
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate reports.' });
  }
};

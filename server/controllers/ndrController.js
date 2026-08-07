const ExceptionNDR = require('../models/ExceptionNDR');
const Booking = require('../models/Booking');

// --- RAISE AN NDR / EXCEPTION (Used by Rider App / Hub Ops) ---
exports.raiseNDR = async (req, res) => {
  try {
    const { bookingId, type, reason, notes, photoUrl, lat, lng } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found.' });

    // Mark booking as Failed or Delayed based on type
    if (type === 'Delivery NDR' || type === 'Pickup Exception') {
      booking.status = 'Failed';
    } else {
      booking.status = 'Delayed';
    }

    booking.trackingHistory.push({
      status: booking.status,
      scanType: type,
      description: `Exception raised: ${reason}`,
      scannedBy: req.user?.id,
      gps: (lat && lng) ? { lat, lng } : undefined
    });
    await booking.save();

    // Check if an open NDR already exists to just increment reattempts, else create new
    let ndr = await ExceptionNDR.findOne({ booking: bookingId, status: { $in: ['Open', 'Action Required'] } });
    
    if (ndr) {
      ndr.reattemptCount += 1;
      ndr.reason = reason;
      ndr.evidence = { photoUrl, notes, gps: { lat, lng } };
      ndr.status = 'Action Required'; // Needs ops review again
      await ndr.save();
    } else {
      ndr = await ExceptionNDR.create({
        booking: bookingId,
        type,
        reason,
        evidence: { photoUrl, notes, gps: { lat, lng } },
        raisedBy: req.user?.id
      });
    }

    res.status(201).json({ success: true, data: ndr });
  } catch (err) {
    console.error('[NDR Engine]', err);
    res.status(500).json({ success: false, error: 'Failed to raise NDR.' });
  }
};

// --- GET ALL NDRs (Admin Dashboard) ---
exports.getNDRs = async (req, res) => {
  try {
    const ndrs = await ExceptionNDR.find()
      .populate('booking')
      .populate('owner', 'name email')
      .populate('raisedBy', 'name')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, data: ndrs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch NDRs.' });
  }
};

// --- RESOLVE NDR (Ops Team) ---
exports.resolveNDR = async (req, res) => {
  try {
    const { action, notes } = req.body;
    const ndr = await ExceptionNDR.findById(req.params.id).populate('booking');
    
    if (!ndr) return res.status(404).json({ success: false, error: 'NDR not found.' });

    ndr.status = 'Resolved';
    ndr.resolution = { action, notes, resolvedAt: new Date() };
    ndr.owner = req.user?.id;
    await ndr.save();

    const booking = ndr.booking;
    if (booking) {
      if (action === 'Reattempt') {
        booking.status = 'Out for Delivery';
        booking.trackingHistory.push({ status: 'Out for Delivery', scanType: 'Reattempt Scheduled', description: notes || 'Delivery reattempt scheduled.', scannedBy: req.user?.id });
      } else if (action === 'Return to Sender') {
        booking.status = 'Returned'; // Or trigger Reverse Logistics flow
        booking.trackingHistory.push({ status: 'Returned', scanType: 'Marked for RTO', description: 'Maximum attempts reached or Ops marked for RTO.', scannedBy: req.user?.id });
      } else {
        booking.trackingHistory.push({ status: booking.status, scanType: `NDR Resolved: ${action}`, description: notes, scannedBy: req.user?.id });
      }
      await booking.save();
    }

    res.status(200).json({ success: true, data: ndr });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to resolve NDR.' });
  }
};

// --- GET AGING REPORT (Metrics) ---
exports.getAgingReport = async (req, res) => {
  try {
    const now = new Date();
    const ndrs = await ExceptionNDR.find({ status: { $in: ['Open', 'Action Required'] } });
    
    const report = {
      '0-24h': 0,
      '24-48h': 0,
      '48-72h': 0,
      '72h+': 0
    };

    ndrs.forEach(ndr => {
      const diffHours = Math.abs(now - ndr.createdAt) / 36e5;
      if (diffHours <= 24) report['0-24h']++;
      else if (diffHours <= 48) report['24-48h']++;
      else if (diffHours <= 72) report['48-72h']++;
      else report['72h+']++;
    });

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate aging report.' });
  }
};

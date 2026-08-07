const ReturnRequest = require('../models/ReturnRequest');
const Booking = require('../models/Booking');

// --- INITIATE A RETURN ---
exports.initiateReturn = async (req, res) => {
  try {
    const { bookingId, reason, notes } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found.' });

    // Check if return already exists
    const existing = await ReturnRequest.findOne({ booking: bookingId });
    if (existing) return res.status(400).json({ success: false, error: 'Return already initiated for this booking.' });

    // Calculate reverse charges (e.g., 80% of original base + weight + distance)
    const baseReturnCharge = (booking.pricing.base + booking.pricing.weight + booking.pricing.distance) * 0.8;
    
    let refundAdjustment = 0;
    // Simple logic: if sender paid, and receiver refused, sender still pays return. Refund = 0.
    // If damaged in transit, we might waive return charge and process full refund.
    if (reason === 'Damaged') {
      refundAdjustment = booking.pricing.total; // Full refund
    } else {
      refundAdjustment = -(baseReturnCharge); // Negative means charge the customer
    }

    const returnReq = await ReturnRequest.create({
      booking: bookingId,
      reason,
      notes,
      returnCharges: baseReturnCharge,
      refundAdjustment,
      initiatedBy: req.user?.id
    });

    // Update original booking status
    booking.status = 'Returned';
    booking.trackingHistory.push({
      status: 'Returned',
      scanType: 'Return Initiated',
      description: `Return initiated due to: ${reason}`,
      scannedBy: req.user?.id
    });
    await booking.save();

    res.status(201).json({ success: true, data: returnReq });
  } catch (err) {
    console.error('[Reverse Logistics]', err);
    res.status(500).json({ success: false, error: 'Failed to initiate return.' });
  }
};

// --- GET ALL RETURNS ---
exports.getReturns = async (req, res) => {
  try {
    const returns = await ReturnRequest.find()
      .populate('booking')
      .populate('initiatedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, data: returns });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch returns.' });
  }
};

// --- UPDATE RETURN STATUS ---
exports.updateReturnStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const returnReq = await ReturnRequest.findById(req.params.id).populate('booking');
    
    if (!returnReq) return res.status(404).json({ success: false, error: 'Return not found.' });

    returnReq.status = status;
    if (status === 'Approved') {
      returnReq.approvedBy = req.user?.id;
    }
    
    await returnReq.save();

    // Sync with Booking tracking history
    const booking = returnReq.booking;
    if (booking) {
      booking.trackingHistory.push({
        status: 'Returned',
        scanType: `Reverse: ${status}`,
        description: `Reverse logistics update: ${status}`,
        scannedBy: req.user?.id
      });
      await booking.save();
    }

    res.status(200).json({ success: true, data: returnReq });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update return status.' });
  }
};

// --- CAPTURE RETURN POD ---
exports.captureReturnPOD = async (req, res) => {
  try {
    const { signatureUrl, photoUrl, lat, lng } = req.body;
    const returnReq = await ReturnRequest.findById(req.params.id).populate('booking');
    
    if (!returnReq) return res.status(404).json({ success: false, error: 'Return not found.' });

    returnReq.proofOfReturn = {
      signatureUrl,
      photoUrl,
      gps: { lat, lng },
      timestamp: new Date()
    };
    returnReq.status = 'Returned to Sender';
    await returnReq.save();

    // Final tracking sync
    const booking = returnReq.booking;
    if (booking) {
      booking.trackingHistory.push({
        status: 'Returned',
        scanType: 'Returned to Sender',
        description: 'Parcel successfully handed back to sender.',
        scannedBy: req.user?.id,
        gps: { lat, lng }
      });
      await booking.save();
    }

    res.status(200).json({ success: true, data: returnReq });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to capture POD.' });
  }
};

const Booking = require('../models/Booking');
const ScanEvent = require('../models/ScanEvent');

// Map scan types to booking statuses
const SCAN_STATUS_MAP = {
  Pickup: 'Picked Up',
  SourceHubReceive: 'Source Hub Received',
  Sort: 'Sorted',
  PartnerHandover: 'Partner Handover',
  PartnerAccept: 'In Transit',
  DestinationHubReceive: 'Destination Hub Received',
  OutForDelivery: 'Out for Delivery',
  Delivered: 'Delivered',
  Return: 'Returned'
};

// Expected scan order for mismatch detection
const SCAN_ORDER = [
  'Pickup', 'SourceHubReceive', 'Sort', 'PartnerHandover',
  'PartnerAccept', 'DestinationHubReceive', 'OutForDelivery', 'Delivered'
];

// --- MAIN SCAN ENDPOINT ---
exports.processscan = async (req, res) => {
  try {
    const {
      trackingId, bookingId, scanType,
      hubId, partnerId, deviceId,
      gps, parcelCondition, notes
    } = req.body;

    if (!scanType || !SCAN_STATUS_MAP[scanType]) {
      return res.status(400).json({ success: false, error: 'Invalid scan type.' });
    }

    // 1. Lookup booking
    const query = trackingId ? { trackingId } : { _id: bookingId };
    const booking = await Booking.findOne(query);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Parcel not found. Check tracking ID.' });
    }

    // 2. Duplicate scan detection
    const existingScan = await ScanEvent.findOne({
      bookingId: booking._id,
      scanType,
      isDuplicate: false
    });
    if (existingScan) {
      // Record as duplicate but do not update booking
      await ScanEvent.create({
        bookingId: booking._id,
        trackingId: booking.trackingId,
        scanType,
        scannedBy: req.user?.id,
        hubId, partnerId, deviceId: deviceId || 'Web',
        gps, parcelCondition: parcelCondition || 'Good',
        notes,
        isDuplicate: true,
        isMismatch: false
      });
      return res.status(409).json({
        success: false,
        warning: 'DUPLICATE_SCAN',
        error: `This parcel was already scanned at checkpoint "${scanType}" on ${existingScan.createdAt.toLocaleString()}.`
      });
    }

    // 3. Mismatch detection (out-of-order scan check)
    const currentStatusIdx = SCAN_ORDER.indexOf(
      Object.keys(SCAN_STATUS_MAP).find(k => SCAN_STATUS_MAP[k] === booking.status)
    );
    const newScanIdx = SCAN_ORDER.indexOf(scanType);
    let isMismatch = false;
    let mismatchReason = null;

    if (newScanIdx !== -1 && currentStatusIdx !== -1 && newScanIdx < currentStatusIdx) {
      isMismatch = true;
      mismatchReason = `Scan type "${scanType}" is out of order. Current status is "${booking.status}".`;
    }

    // 4. Build new status
    const newStatus = SCAN_STATUS_MAP[scanType];

    // 5. Save ScanEvent record
    await ScanEvent.create({
      bookingId: booking._id,
      trackingId: booking.trackingId,
      scanType,
      scannedBy: req.user?.id,
      hubId,
      partnerId,
      deviceId: deviceId || 'Web',
      gps,
      parcelCondition: parcelCondition || 'Good',
      notes,
      isDuplicate: false,
      isMismatch,
      mismatchReason
    });

    // 5.1 Create HubRecord if applicable
    if (hubId) {
      const HubRecord = require('../models/HubRecord');
      let recordType = 'Other';
      if (scanType === 'SourceHubReceive' || scanType === 'DestinationHubReceive') {
        recordType = scanType === 'SourceHubReceive' ? 'Inbound From Rider' : 'Inbound From Hub';
      } else if (scanType === 'OutForDelivery') {
        recordType = 'Outbound To Rider';
      }

      if (recordType !== 'Other') {
        await HubRecord.create({
          hubId,
          bookingId: booking._id,
          trackingId: booking.trackingId,
          recordType,
          actionBy: req.user?.id,
          customerDetails: booking.senderDetails ? { name: booking.senderDetails.name, phone: booking.senderDetails.phone } : undefined,
          destination: booking.dropLocation ? { address: booking.dropLocation.address, pincode: booking.dropLocation.pincode } : undefined,
          notes: notes || `Scan: ${scanType}`
        });
      }
    }

    // 6. Update booking status and trackingHistory
    booking.status = newStatus;
    booking.trackingHistory.push({
      status: newStatus,
      scanType,
      description: notes || `Scanned at checkpoint: ${scanType}`,
      scannedBy: req.user?.id,
      hubId,
      deviceId: deviceId || 'Web',
      gps,
      parcelCondition: parcelCondition || 'Good'
    });
    await booking.save();

    return res.status(200).json({
      success: true,
      data: {
        trackingId: booking.trackingId,
        newStatus,
        scanType,
        isMismatch,
        mismatchReason,
        parcelCondition: parcelCondition || 'Good',
        scannedAt: new Date().toISOString()
      },
      warning: isMismatch ? mismatchReason : null
    });
  } catch (error) {
    console.error('[Scan] Error:', error.message);
    res.status(500).json({ success: false, error: 'Scan processing failed.' });
  }
};

// --- GET SCAN HISTORY FOR A PARCEL ---
exports.getScanHistory = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const booking = await Booking.findOne({ trackingId });
    if (!booking) return res.status(404).json({ success: false, error: 'Parcel not found.' });

    const scans = await ScanEvent.find({ bookingId: booking._id })
      .populate('scannedBy', 'name role')
      .populate('hubId', 'name hubType')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: scans });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch scan history.' });
  }
};

// --- GET UNSCANNED ALERT LIST ---
// Parcels that haven't been scanned past "SourceHubReceive" within 24h of pickup
exports.getUnscannedAlerts = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find bookings that are stuck at Picked Up or Source Hub Received for > 24 hours
    const stuckBookings = await Booking.find({
      status: { $in: ['Picked Up', 'Source Hub Received', 'Booking Confirmed'] },
      updatedAt: { $lte: twentyFourHoursAgo }
    })
    .select('trackingId status updatedAt pickupLocation dropLocation receiver')
    .limit(100);

    res.status(200).json({ success: true, data: stuckBookings, count: stuckBookings.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch unscanned alerts.' });
  }
};

// --- GET ALL SCAN EVENTS (with filters) ---
exports.getAllScans = async (req, res) => {
  try {
    const { scanType, isDuplicate, isMismatch, hubId, from, to } = req.query;
    const filter = {};
    if (scanType) filter.scanType = scanType;
    if (isDuplicate !== undefined) filter.isDuplicate = isDuplicate === 'true';
    if (isMismatch !== undefined) filter.isMismatch = isMismatch === 'true';
    if (hubId) filter.hubId = hubId;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const scans = await ScanEvent.find(filter)
      .populate('scannedBy', 'name role')
      .populate('hubId', 'name')
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({ success: true, data: scans, count: scans.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch scans.' });
  }
};

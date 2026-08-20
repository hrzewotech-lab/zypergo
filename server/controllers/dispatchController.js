const Booking = require('../models/Booking');
const User = require('../models/User');
const Partner = require('../models/Partner');
const DispatchRule = require('../models/DispatchRule');

// ─── Utility: Haversine distance (km) ───────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 9999;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Utility: Get active dispatch rule ───────────────────────────────────────
async function getActiveRule() {
  let rule = await DispatchRule.findOne({ isActive: true });
  if (!rule) rule = new DispatchRule(); // use defaults
  return rule;
}

// ─── Utility: Normalise a score to 0-100 ─────────────────────────────────────
function normalise(value, min, max) {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GET PENDING BOOKINGS (awaiting pickup assignment)
// ═══════════════════════════════════════════════════════════════════════════════
exports.getPendingPickups = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: { $in: ['Booking Confirmed', 'Pending'] },
      'assignedRiders': { $size: 0 }
    })
      .select('trackingId status pickupLocation dropLocation receiver packageDetails scheduling preferences metadata createdAt')
      .sort({ 'scheduling.date': 1, createdAt: 1 })
      .limit(50);

    res.status(200).json({ success: true, data: bookings, count: bookings.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch pending pickups.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  GET PENDING LAST-MILE DELIVERIES
// ═══════════════════════════════════════════════════════════════════════════════
exports.getPendingDeliveries = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: { $in: ['Destination Hub Received', 'Sorted'] },
    })
      .populate('metadata.destinationHub', 'name hubType address')
      .select('trackingId status dropLocation receiver packageDetails preferences metadata createdAt eta')
      .sort({ eta: 1, createdAt: 1 })
      .limit(100);

    res.status(200).json({ success: true, data: bookings, count: bookings.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch pending deliveries.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  GET AVAILABLE RIDERS (online + on shift)
// ═══════════════════════════════════════════════════════════════════════════════
exports.getAvailableRiders = async (req, res) => {
  try {
    const { mode } = req.query; // 'pickup' or 'delivery'

    const roleFilter = ['Both'];
    if (mode === 'pickup') roleFilter.push('Pickup Only');
    else if (mode === 'delivery') roleFilter.push('Delivery Only');

    const riders = await User.find({
      role: 'Rider',
      isActive: true,
      'riderDetails.isOnline': true,
      'riderDetails.isOnShift': true,
      'riderDetails.approvalStatus': 'Approved',
      'riderDetails.roleFlexibility': { $in: roleFilter }
    })
      .select('name riderDetails.vehicleType riderDetails.currentLocation riderDetails.performance riderDetails.earnings riderDetails.isOnBreak riderDetails.assignedHub')
      .limit(50);

    // Count active tasks for each rider
    const riderIds = riders.map(r => r._id);
    const taskCounts = await Booking.aggregate([
      { $unwind: '$assignedRiders' },
      { $match: { 'assignedRiders.riderId': { $in: riderIds }, 'assignedRiders.status': 'Active' } },
      { $group: { _id: '$assignedRiders.riderId', tasks: { $sum: 1 } } }
    ]);
    const taskMap = {};
    taskCounts.forEach(t => { taskMap[t._id.toString()] = t.tasks; });

    const enriched = riders.map(r => ({
      _id: r._id,
      name: r.name,
      vehicleType: r.riderDetails?.vehicleType,
      currentLocation: r.riderDetails?.currentLocation,
      performance: r.riderDetails?.performance,
      isOnBreak: r.riderDetails?.isOnBreak,
      activeTasks: taskMap[r._id.toString()] || 0
    }));

    res.status(200).json({ success: true, data: enriched, count: enriched.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch available riders.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  AUTO-ASSIGN PICKUP RIDER
// ═══════════════════════════════════════════════════════════════════════════════
exports.autoAssignPickup = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, error: 'bookingId required.' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found.' });

    const rule = await getActiveRule();
    const { maxTasksPerRider, maxKmFromPickup, pickupWeights } = rule;

    // Get eligible riders
    const riders = await User.find({
      role: 'Rider',
      isActive: true,
      'riderDetails.isOnline': true,
      'riderDetails.isOnShift': true,
      'riderDetails.isOnBreak': false,
      'riderDetails.approvalStatus': 'Approved',
      'riderDetails.roleFlexibility': { $in: ['Both', 'Pickup Only'] }
    }).select('name riderDetails');

    // Get task counts
    const riderIds = riders.map(r => r._id);
    const taskCounts = await Booking.aggregate([
      { $unwind: '$assignedRiders' },
      { $match: { 'assignedRiders.riderId': { $in: riderIds }, 'assignedRiders.status': 'Active' } },
      { $group: { _id: '$assignedRiders.riderId', tasks: { $sum: 1 } } }
    ]);
    const taskMap = {};
    taskCounts.forEach(t => { taskMap[t._id.toString()] = t.tasks; });

    const pickupLat = booking.pickupLocation?.lat;
    const pickupLng = booking.pickupLocation?.lng;
    const parcelWeight = booking.packageDetails?.weight || 1;

    // Vehicle capacity weights (kg)
    const vehicleCapacity = { 'Scooter': 20, 'Mini 3W': 90, '3 Wheeler': 500, 'Tata Ace': 750, 'Pickup 8ft': 1200, 'Pickup 9ft': 1700, '14ft': 3500, '17ft': 6000 };

    // Score each rider
    const scored = riders
      .map(r => {
        const activeTasks = taskMap[r._id.toString()] || 0;
        if (activeTasks >= maxTasksPerRider) return null; // overloaded

        const rLat = r.riderDetails?.currentLocation?.lat;
        const rLng = r.riderDetails?.currentLocation?.lng;
        const distKm = haversineKm(rLat, rLng, pickupLat, pickupLng);
        if (distKm > maxKmFromPickup) return null; // too far

        const vCap = vehicleCapacity[r.riderDetails?.vehicleType] || 15;
        if (parcelWeight > vCap) return null; // can't carry

        // Normalised scores (higher is better)
        const distScore = 100 - normalise(distKm, 0, maxKmFromPickup); // closer = higher
        const loadScore = 100 - normalise(activeTasks, 0, maxTasksPerRider); // fewer tasks = higher
        const vehicleScore = normalise(vCap, 15, 3000);                   // bigger = higher
        const perfScore = r.riderDetails?.performance?.punctualityScore || 80;

        const w = pickupWeights;
        const composite =
          (distScore * w.distanceScore +
           loadScore * w.loadScore +
           vehicleScore * w.vehicleScore +
           perfScore * w.performanceScore) / 100;

        return {
          rider: { _id: r._id, name: r.name, vehicleType: r.riderDetails?.vehicleType, activeTasks, distKm: distKm.toFixed(1) },
          distKm,
          score: composite
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      return res.status(200).json({ success: false, error: 'No eligible riders found within range. Try manual assignment.', candidates: [] });
    }

    const best = scored[0];

    // Assign the best rider to the booking
    await Booking.findByIdAndUpdate(bookingId, {
      status: 'Rider Assigned',
      $push: {
        assignedRiders: { riderId: best.rider._id, status: 'Active' },
        trackingHistory: {
          status: 'Rider Assigned',
          description: `Auto-assigned to rider ${best.rider.name} (${best.rider.vehicleType}), ${best.distKm} km away. Score: ${best.score.toFixed(1)}`
        }
      }
    });

    res.status(200).json({
      success: true,
      assigned: best.rider,
      score: best.score.toFixed(1),
      allCandidates: scored.slice(0, 5).map(s => ({ ...s.rider, score: s.score.toFixed(1) }))
    });
  } catch (err) {
    console.error('[Auto-Pickup]', err.message);
    res.status(500).json({ success: false, error: 'Auto-assign failed.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  AUTO-ASSIGN LAST-MILE RIDER
// ═══════════════════════════════════════════════════════════════════════════════
exports.autoAssignLastMile = async (req, res) => {
  try {
    const { bookingIds } = req.body;
    if (!bookingIds?.length) return res.status(400).json({ success: false, error: 'bookingIds required.' });

    const bookings = await Booking.find({ _id: { $in: bookingIds } })
      .populate('metadata.destinationHub');

    const rule = await getActiveRule();
    const { lastMileWeights, maxTasksPerRider } = rule;

    // Get eligible delivery riders
    const riders = await User.find({
      role: 'Rider',
      isActive: true,
      'riderDetails.isOnline': true,
      'riderDetails.isOnShift': true,
      'riderDetails.isOnBreak': false,
      'riderDetails.approvalStatus': 'Approved',
      'riderDetails.roleFlexibility': { $in: ['Both', 'Delivery Only'] }
    }).select('name riderDetails');

    const riderIds = riders.map(r => r._id);
    const taskCounts = await Booking.aggregate([
      { $unwind: '$assignedRiders' },
      { $match: { 'assignedRiders.riderId': { $in: riderIds }, 'assignedRiders.status': 'Active' } },
      { $group: { _id: '$assignedRiders.riderId', tasks: { $sum: 1 } } }
    ]);
    const taskMap = {};
    taskCounts.forEach(t => { taskMap[t._id.toString()] = t.tasks; });

    // Group bookings by first 3 digits of drop pincode = cluster
    const clusters = {};
    bookings.forEach(b => {
      const pin = b.dropLocation?.pincode?.substring(0, 3) || 'UNK';
      if (!clusters[pin]) clusters[pin] = [];
      clusters[pin].push(b._id);
    });

    // Score riders for each cluster
    const assignments = [];
    for (const [cluster, clusterBookingIds] of Object.entries(clusters)) {
      const scored = riders
        .map(r => {
          const activeTasks = taskMap[r._id.toString()] || 0;
          if (activeTasks >= maxTasksPerRider) return null;

          const loadScore = 100 - normalise(activeTasks, 0, maxTasksPerRider);
          const perfScore = r.riderDetails?.performance?.punctualityScore || 80;

          const w = lastMileWeights;
          const composite =
            (loadScore * w.availabilityScore +
             perfScore * w.slaScore) / (w.availabilityScore + w.slaScore) * 100;

          return { rider: { _id: r._id, name: r.name, vehicleType: r.riderDetails?.vehicleType }, score: composite };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);

      if (scored.length === 0) continue;
      const best = scored[0];

      // Assign best rider to all bookings in this cluster
      await Booking.updateMany(
        { _id: { $in: clusterBookingIds } },
        {
          status: 'Out for Delivery',
          $push: {
            assignedRiders: { riderId: best.rider._id, status: 'Active' },
            trackingHistory: {
              status: 'Out for Delivery',
              description: `Auto last-mile assigned to ${best.rider.name} (Cluster: ${cluster})`
            }
          }
        }
      );

      // update task map
      taskMap[best.rider._id.toString()] = (taskMap[best.rider._id.toString()] || 0) + clusterBookingIds.length;

      assignments.push({ cluster, bookingCount: clusterBookingIds.length, assignedRider: best.rider });
    }

    res.status(200).json({ success: true, assignments, totalBookings: bookingIds.length });
  } catch (err) {
    console.error('[Last-Mile]', err.message);
    res.status(500).json({ success: false, error: 'Auto last-mile assign failed.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  MANUAL OVERRIDE — assign specific rider to booking
// ═══════════════════════════════════════════════════════════════════════════════
exports.manualAssign = async (req, res) => {
  try {
    const { bookingId, riderId, notes } = req.body;
    if (!bookingId || !riderId) return res.status(400).json({ success: false, error: 'bookingId and riderId required.' });

    const rider = await User.findById(riderId).select('name riderDetails.vehicleType');
    if (!rider) return res.status(404).json({ success: false, error: 'Rider not found.' });

    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status: 'Rider Assigned',
      $push: {
        assignedRiders: { riderId: riderId, status: 'Active' },
        trackingHistory: {
          status: 'Rider Assigned',
          scannedBy: req.user?.id,
          description: `Manual override by ${req.user?.role || 'Dispatch Manager'}. Rider: ${rider.name}. ${notes || ''}`
        }
      }
    }, { new: true });

    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found.' });

    res.status(200).json({ success: true, data: booking, assignedRider: rider });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Manual assign failed.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  PARTNER RECOMMENDATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
exports.recommendPartners = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, error: 'bookingId required.' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found.' });

    const destPincode = booking.dropLocation?.pincode;
    const parcelWeight = booking.packageDetails?.weight || 1;
    const parcelType = booking.packageDetails?.category || 'General Parcel';
    const isSlaExpress = booking.preferences?.speed === 'Express';

    // Check cutoff — current time in HH:MM
    const rule = await getActiveRule();
    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Fetch all active partners
    const partners = await Partner.find({ isActive: true });

    // Reset daily load if needed
    const today = new Date().toDateString();
    for (const p of partners) {
      if (!p.lastLoadResetDate || new Date(p.lastLoadResetDate).toDateString() !== today) {
        p.currentLoad = 0;
        p.lastLoadResetDate = new Date();
        await p.save();
      }
    }

    // Filter eligible partners
    const eligible = partners.filter(p => {
      // 1. Serviceability check — pincode or city
      const servicesRoute = !destPincode || p.serviceability.servicePincodes.includes(destPincode) || p.serviceability.servicePincodes.length === 0;

      // 2. Weight check
      const canCarryWeight = parcelWeight <= p.serviceability.maxWeight;

      // 3. Parcel type check
      const supportsType = p.serviceability.supportedParcelTypes.includes(parcelType) || p.serviceability.supportedParcelTypes.length === 0;

      // 4. Cutoff time check
      const cutoffPassed = rule.enforceCutoffTime && currentHHMM > p.cutoffTime;

      // 5. Capacity check
      const capacityExceeded = rule.enforceCapacityLimit && p.currentLoad >= p.capacityLimit;

      return servicesRoute && canCarryWeight && supportsType && !cutoffPassed && !capacityExceeded;
    });

    if (eligible.length === 0) {
      return res.status(200).json({ success: false, error: 'No eligible partners available for this route.', reason: 'Check pincode coverage, cutoff times, or capacity.', recommendations: null });
    }

    // Score each eligible partner
    const estDistance = 50; // placeholder km — integrate Maps API for real
    const scored = eligible.map(p => {
      const estimatedCost = p.rates.baseRate + (parcelWeight * p.rates.perKgRate) + (estDistance * p.rates.perKmRate);
      const w = rule.partnerWeights;

      // Rate score: cheaper = higher
      const maxCost = 2000;
      const rateScore = 100 - normalise(estimatedCost, 50, maxCost);

      // Speed score: faster = higher
      const speedMap = { 'Same-Day': 100, 'Express': 70, 'Standard': 30 };
      const speedScore = speedMap[p.speed] || 30;

      const slaScore = p.slaScore;
      const successScore = p.deliverySuccessRate;

      const composite =
        (rateScore * w.rateScore +
         speedScore * w.speedScore +
         slaScore * w.slaScore +
         successScore * w.successRateScore) / 100;

      return {
        partner: {
          _id: p._id,
          companyName: p.companyName,
          partnerType: p.partnerType,
          speed: p.speed,
          avgDeliveryDays: p.avgDeliveryDays,
          cutoffTime: p.cutoffTime,
          slaScore: p.slaScore,
          deliverySuccessRate: p.deliverySuccessRate,
          capacityRemaining: p.capacityLimit - p.currentLoad
        },
        estimatedCost: Math.round(estimatedCost),
        rateScore: rateScore.toFixed(1),
        speedScore: speedScore.toFixed(1),
        compositeScore: composite.toFixed(1),
        costBreakdown: {
          base: p.rates.baseRate,
          weight: Math.round(parcelWeight * p.rates.perKgRate),
          distance: Math.round(estDistance * p.rates.perKmRate)
        }
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);

    // Build three tiers
    const cheapest = [...scored].sort((a, b) => a.estimatedCost - b.estimatedCost)[0];
    const fastest = [...scored].sort((a, b) => {
      const sm = { 'Same-Day': 0, 'Express': 1, 'Standard': 2 };
      return sm[a.partner.speed] - sm[b.partner.speed] || a.partner.avgDeliveryDays - b.partner.avgDeliveryDays;
    })[0];
    const recommended = scored[0]; // highest composite score

    res.status(200).json({
      success: true,
      recommendations: { cheapest, fastest, recommended },
      allEligible: scored,
      bookingId,
      parcelWeight,
      parcelType,
      destPincode
    });
  } catch (err) {
    console.error('[Partner Recommend]', err.message);
    res.status(500).json({ success: false, error: 'Partner recommendation failed.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  ASSIGN PARTNER TO BOOKING
// ═══════════════════════════════════════════════════════════════════════════════
exports.assignPartner = async (req, res) => {
  try {
    const { bookingId, partnerId } = req.body;
    if (!bookingId || !partnerId) return res.status(400).json({ success: false, error: 'bookingId and partnerId required.' });

    const partner = await Partner.findById(partnerId);
    if (!partner) return res.status(404).json({ success: false, error: 'Partner not found.' });

    const booking = await Booking.findByIdAndUpdate(bookingId, {
      'metadata.assignedPartner': partnerId,
      status: 'Partner Handover',
      $push: {
        trackingHistory: {
          status: 'Partner Handover',
          description: `Partner assigned: ${partner.companyName}`
        }
      }
    }, { new: true });

    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found.' });

    // Increment partner daily load
    await Partner.findByIdAndUpdate(partnerId, { $inc: { currentLoad: 1 } });

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to assign partner.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  ROUTE GROUPING — cluster pending deliveries by pincode
// ═══════════════════════════════════════════════════════════════════════════════
exports.groupRoutes = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: { $in: ['Destination Hub Received', 'Sorted', 'Booking Confirmed'] },
      'assignedRiders': { $size: 0 }
    }).select('trackingId dropLocation receiver packageDetails preferences');

    const clusters = {};
    bookings.forEach(b => {
      const pin3 = b.dropLocation?.pincode?.substring(0, 3) || 'UNK';
      if (!clusters[pin3]) {
        clusters[pin3] = { cluster: pin3, bookings: [], totalWeight: 0, expressCount: 0 };
      }
      clusters[pin3].bookings.push({ id: b._id, trackingId: b.trackingId, address: b.dropLocation?.address, receiver: b.receiver?.name, weight: b.packageDetails?.weight || 0, speed: b.preferences?.speed });
      clusters[pin3].totalWeight += b.packageDetails?.weight || 0;
      if (b.preferences?.speed === 'Express') clusters[pin3].expressCount++;
    });

    const result = Object.values(clusters).sort((a, b) => b.expressCount - a.expressCount || b.bookings.length - a.bookings.length);

    res.status(200).json({ success: true, data: result, totalBookings: bookings.length, clusterCount: result.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Route grouping failed.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  GET / UPDATE DISPATCH RULES
// ═══════════════════════════════════════════════════════════════════════════════
exports.getDispatchRules = async (req, res) => {
  try {
    let rule = await DispatchRule.findOne({ isActive: true });
    if (!rule) { rule = await DispatchRule.create({ createdBy: req.user?.id }); }
    res.status(200).json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch dispatch rules.' });
  }
};

exports.updateDispatchRules = async (req, res) => {
  try {
    const rule = await DispatchRule.findOneAndUpdate({ isActive: true }, req.body, { new: true, upsert: true });
    res.status(200).json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update dispatch rules.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  REAL-TIME BROADCAST & ACCEPT (SOCKET.IO)
// ═══════════════════════════════════════════════════════════════════════════════
exports.broadcastToNearby = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    // Use a fixed max radius for nearby riders (e.g., 15km)
    const MAX_RADIUS = 15;
    const pickupLat = booking.pickupLocation?.lat;
    const pickupLng = booking.pickupLocation?.lng;

    // Find all online riders
    const riders = await User.find({
      role: 'Rider',
      isActive: true,
      'riderDetails.isOnline': true,
      'riderDetails.isOnShift': true,
      'riderDetails.isOnBreak': false,
    });

    const nearbyRiders = [];
    riders.forEach(r => {
      const rLat = r.riderDetails?.currentLocation?.lat;
      const rLng = r.riderDetails?.currentLocation?.lng;
      if (rLat && rLng) {
        const dist = haversineKm(pickupLat, pickupLng, rLat, rLng);
        if (dist <= MAX_RADIUS) {
          nearbyRiders.push(r._id.toString());
        }
      }
    });

    // Broadcast via socket.io to the general available_riders room or specific riders
    try {
      const socketService = require('../socket');
      const io = socketService.getIO();
      // For simplicity, we emit to a global room, but frontend checks proximity
      // OR we can emit to specific rider rooms if we know their socket IDs.
      io.to('available_riders').emit('new_booking_available', {
        bookingId: booking._id,
        pickupLocation: booking.pickupLocation,
        dropLocation: booking.dropLocation,
        packageDetails: booking.packageDetails,
        pricing: booking.pricing,
        targetRiders: nearbyRiders // Frontend of each rider will check if their ID is in this list
      });
      console.log(`[Dispatch] Broadcasted booking ${booking.trackingId} to ${nearbyRiders.length} nearby riders.`);
    } catch (e) {
      console.error('[Dispatch] Socket.io broadcast failed (maybe not initialized).', e);
    }

    res.status(200).json({ success: true, message: 'Broadcasted successfully', targetCount: nearbyRiders.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to broadcast' });
  }
};

exports.acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const riderId = req.user ? req.user.id : req.body.riderId; // fallback for mock auth

    // Atomic update to ensure only the FIRST rider who accepts gets it
    const booking = await Booking.findOneAndUpdate(
      { 
        _id: bookingId, 
        status: { $in: ['Pending', 'Booking Confirmed', 'Relay Handoff Pending'] },
        currentRider: { $exists: false } // ensure no one else has taken it
      },
      {
        status: 'Rider Assigned',
        currentRider: riderId,
        $push: {
          assignedRiders: { riderId: riderId, status: 'Active' },
          trackingHistory: {
            status: 'Rider Assigned',
            description: `Booking accepted by rider ${riderId}.`
          }
        }
      },
      { new: true }
    ).populate('currentRider', 'name phone');

    if (!booking) {
      return res.status(400).json({ success: false, error: 'Booking no longer available or already accepted.' });
    }

    // Emit event to remove it from other riders' screens
    try {
      const socketService = require('../socket');
      const io = socketService.getIO();
      io.to('available_riders').emit('booking_accepted_by_other', { bookingId });
      console.log(`[Dispatch] Booking ${booking.trackingId} accepted by ${riderId}. Broadcasted removal.`);
    } catch (e) {}

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to accept booking' });
  }
};


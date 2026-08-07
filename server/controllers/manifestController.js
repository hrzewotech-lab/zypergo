const Manifest = require('../models/Manifest');
const Booking = require('../models/Booking');

// --- CREATE MANIFEST ---
exports.createManifest = async (req, res) => {
  try {
    const {
      manifestType, type, sourceHub, destinationHub,
      assignedPartner, route, notes, parcels // array of bookingIds
    } = req.body;

    if (!manifestType || !parcels || parcels.length === 0) {
      return res.status(400).json({ success: false, error: 'manifestType and parcels are required.' });
    }

    // Fetch booking details to calculate weight and build parcel list
    const bookings = await Booking.find({ _id: { $in: parcels } })
      .select('trackingId packageDetails.weight status');

    const parcelItems = bookings.map(b => ({
      bookingId: b._id,
      trackingId: b.trackingId,
      weight: b.packageDetails?.weight || 0,
      scanned: false
    }));

    const totalWeight = parcelItems.reduce((sum, p) => sum + p.weight, 0);
    const manifestId = `MF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const manifest = await Manifest.create({
      manifestId,
      manifestType,
      type: type || 'Bag',
      sourceHub,
      destinationHub,
      assignedPartner,
      route,
      parcels: parcelItems,
      parcelCount: parcelItems.length,
      totalWeight,
      notes,
      operator: req.user?.id,
      createdBy: req.user?.id,
      status: 'Created'
    });

    // Update booking statuses based on manifestType
    const statusMap = {
      PartnerHandover: 'Partner Handover',
      IntercityTransport: 'In Transit',
      LastMileDelivery: 'Out for Delivery',
      Return: 'Returned'
    };
    const newStatus = statusMap[manifestType];
    if (newStatus) {
      await Booking.updateMany(
        { _id: { $in: parcels } },
        {
          status: newStatus,
          $push: {
            trackingHistory: {
              status: newStatus,
              description: `Added to manifest ${manifestId} (${manifestType})`
            }
          }
        }
      );
    }

    res.status(201).json({ success: true, data: manifest });
  } catch (error) {
    console.error('[Manifest Create] Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create manifest.' });
  }
};

// --- GET ALL MANIFESTS ---
exports.getAllManifests = async (req, res) => {
  try {
    const { manifestType, status, sourceHub, from, to } = req.query;
    const filter = {};
    if (manifestType) filter.manifestType = manifestType;
    if (status) filter.status = status;
    if (sourceHub) filter.sourceHub = sourceHub;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const manifests = await Manifest.find(filter)
      .populate('sourceHub', 'name hubType')
      .populate('destinationHub', 'name hubType')
      .populate('operator', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, data: manifests, count: manifests.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch manifests.' });
  }
};

// --- GET SINGLE MANIFEST (populated) ---
exports.getManifestById = async (req, res) => {
  try {
    const manifest = await Manifest.findById(req.params.id)
      .populate('sourceHub', 'name hubType address')
      .populate('destinationHub', 'name hubType address')
      .populate('assignedPartner', 'name')
      .populate('operator', 'name phone')
      .populate('createdBy', 'name role')
      .populate({
        path: 'parcels.bookingId',
        select: 'trackingId status receiver packageDetails pickupLocation dropLocation'
      });

    if (!manifest) return res.status(404).json({ success: false, error: 'Manifest not found.' });
    res.status(200).json({ success: true, data: manifest });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch manifest.' });
  }
};

// --- SEAL MANIFEST ---
exports.sealManifest = async (req, res) => {
  try {
    const manifest = await Manifest.findById(req.params.id);
    if (!manifest) return res.status(404).json({ success: false, error: 'Manifest not found.' });
    if (manifest.status !== 'Created') {
      return res.status(400).json({ success: false, error: 'Only Created manifests can be sealed.' });
    }
    manifest.status = 'Sealed';
    manifest.sealedAt = new Date();
    if (req.body.digitalSignature) manifest.digitalSignature = req.body.digitalSignature;
    await manifest.save();
    res.status(200).json({ success: true, data: manifest });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to seal manifest.' });
  }
};

// --- DISPATCH MANIFEST ---
exports.dispatchManifest = async (req, res) => {
  try {
    const manifest = await Manifest.findById(req.params.id);
    if (!manifest) return res.status(404).json({ success: false, error: 'Manifest not found.' });
    if (manifest.status !== 'Sealed') {
      return res.status(400).json({ success: false, error: 'Manifest must be Sealed before dispatch.' });
    }
    manifest.status = 'Dispatched';
    manifest.dispatchedAt = new Date();
    await manifest.save();
    res.status(200).json({ success: true, data: manifest });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to dispatch manifest.' });
  }
};

// --- GET PDF DATA (structured payload for frontend print) ---
exports.getManifestPdfData = async (req, res) => {
  try {
    const manifest = await Manifest.findById(req.params.id)
      .populate('sourceHub', 'name hubType address')
      .populate('destinationHub', 'name hubType address')
      .populate('assignedPartner', 'name')
      .populate('operator', 'name phone')
      .populate({
        path: 'parcels.bookingId',
        select: 'trackingId status receiver packageDetails pickupLocation dropLocation'
      });

    if (!manifest) return res.status(404).json({ success: false, error: 'Manifest not found.' });

    // Return structured data ready for PDF rendering on frontend
    const pdfData = {
      manifestId: manifest.manifestId,
      manifestType: manifest.manifestType,
      type: manifest.type,
      status: manifest.status,
      route: manifest.route,
      createdAt: manifest.createdAt,
      sealedAt: manifest.sealedAt,
      dispatchedAt: manifest.dispatchedAt,
      parcelCount: manifest.parcelCount,
      totalWeight: manifest.totalWeight,
      sourceHub: manifest.sourceHub,
      destinationHub: manifest.destinationHub,
      assignedPartner: manifest.assignedPartner,
      operator: manifest.operator,
      notes: manifest.notes,
      parcels: manifest.parcels.map(p => ({
        trackingId: p.trackingId || p.bookingId?.trackingId,
        weight: p.weight,
        receiver: p.bookingId?.receiver,
        status: p.bookingId?.status,
        destination: p.bookingId?.dropLocation?.address
      }))
    };

    res.status(200).json({ success: true, data: pdfData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate manifest data.' });
  }
};

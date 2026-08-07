const Booking = require('../models/Booking');
const NotificationService = require('../services/notificationService');

exports.getAssignedShipments = async (req, res) => {
  try {
    // Mock: fetch shipments where deliveryType is Intercity and status implies it's in the partner network
    const shipments = await Booking.find({ 
      'metadata.deliveryType': 'Intercity Hub-and-Spoke',
      status: { $in: ['Source Hub Received', 'Sorted', 'Partner Handover', 'In Transit'] }
    }).sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: shipments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch partner shipments' });
  }
};

exports.scanShipment = async (req, res) => {
  try {
    const { trackingId } = req.body;
    const booking = await Booking.findOne({ trackingId });
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }
    
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to scan shipment' });
  }
};

exports.updateShipmentStatus = async (req, res) => {
  try {
    const { trackingId, status, reason } = req.body;
    const booking = await Booking.findOne({ trackingId });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    booking.status = status;
    booking.trackingHistory.push({
      status,
      description: reason || `Updated by Partner`
    });

    await booking.save();

    if (status === 'In Transit') {
       NotificationService.notifyInTransit(booking, booking.receiver?.phone || '8888888888');
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
};

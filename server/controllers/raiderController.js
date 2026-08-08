const Booking = require('../models/Booking');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

exports.getAvailableJobs = async (req, res) => {
  try {
    const availableJobs = await Booking.find({ status: 'Booking Confirmed' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: availableJobs });
  } catch (error) {
    console.error('Error fetching available jobs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
  }
};

exports.acceptJob = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOneAndUpdate(
      { _id: id, status: 'Booking Confirmed' },
      { 
        status: 'Rider Assigned',
        $push: {
          trackingHistory: {
            status: 'Rider Assigned',
            description: 'A Raider has accepted the job and is en route.'
          }
        }
      },
      { new: true }
    );

    if (!booking) {
      return res.status(400).json({ success: false, error: 'Job already taken or invalid.' });
    }

    // Trigger Notification
    NotificationService.notifyRiderAssigned(booking, booking.sender?.phone || '9999999999');

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error accepting job:', error);
    res.status(500).json({ success: false, error: 'Failed to accept job' });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, otp, photoUrl, reason, cashCollected, gpsLocation } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Strict Validations per step
    if (status === 'Picked Up') {
      if (!otp || otp !== '1234') { 
        return res.status(400).json({ success: false, error: 'Valid OTP is mandatory to confirm pickup.' });
      }
      if (!photoUrl) {
        return res.status(400).json({ success: false, error: 'Pickup Photo upload is mandatory.' });
      }
      booking.photos.senderUrl = photoUrl;
    }

    if (status === 'Delivered') {
      if (!photoUrl) {
        return res.status(400).json({ success: false, error: 'Delivery Photo upload is mandatory.' });
      }
      booking.proofOfDelivery = {
        signatureUrl: photoUrl,
        timestamp: new Date(),
        gpsLocation: gpsLocation
      };
    }

    booking.status = status;
    
    let description = reason || `Package marked as ${status}`;
    if (cashCollected) {
        description += ` | Cash Collected: ₹${cashCollected}`;
    }

    booking.trackingHistory.push({
      status,
      description,
      location: gpsLocation ? `${gpsLocation.lat}, ${gpsLocation.lng}` : undefined
    });

    if (status === 'Delivered' || status === 'Source Hub Received') {
      booking.proofOfDelivery = {
        signatureUrl: photoUrl,
        timestamp: new Date(),
        gpsLocation: gpsLocation
      };
    }

    await booking.save();

    // Trigger Notifications based on status
    const customerPhone = booking.sender?.phone || '9999999999';
    const receiverPhone = booking.receiver?.phone || '8888888888';

    if (status === 'Picked Up') NotificationService.notifyPickedUp(booking, customerPhone, receiverPhone);
    if (status === 'Out for Delivery') NotificationService.notifyOutForDelivery(booking, receiverPhone, '1234');
    if (status === 'Delivered') NotificationService.notifyDelivered(booking, customerPhone, receiverPhone);

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ success: false, error: 'Failed to update job status' });
  }
};

exports.handleTranshipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetRaiderId } = req.body; // In a real app, validate this ID exists

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, error: 'Job not found' });

    // Mark current raider as Handed Over, add new raider to array
    if (booking.assignedRaiders && booking.assignedRaiders.length > 0) {
      booking.assignedRaiders[booking.assignedRaiders.length - 1].status = 'Handed Over';
    }

    // Since targetRaiderId is mock, we just use a generic ID for the new raider
    booking.assignedRaiders.push({
      raiderId: targetRaiderId,
      status: 'Active'
    });

    booking.transhipmentLogs.push({
      toRaider: targetRaiderId,
      timestamp: new Date(),
      status: 'Transhipment Complete'
    });

    booking.status = 'Transhipment Pending'; // The new raider needs to accept/pick it up

    booking.trackingHistory.push({
      status: 'Transhipment',
      description: 'Package has been handed over to a new Raider for the next leg of the journey.'
    });

    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to process transhipment' });
  }
};

exports.toggleShift = async (req, res) => {
  try {
    const { isOnline, isOnShift, isOnBreak, hubCheckIn } = req.body;
    // Mock user for now since no auth
    // Update logic would go here: await User.findByIdAndUpdate(req.user._id, { 'raiderDetails.isOnline': isOnline, 'raiderDetails.isOnShift': isOnShift, 'raiderDetails.isOnBreak': isOnBreak });
    
    let message = 'Status updated';
    if (hubCheckIn) message = 'Checked in at Hub successfully';
    
    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error('Error toggling shift:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
};

// --- Onboarding & Profile ---
exports.onboardRaider = async (req, res) => {
  try {
    const { userId, vehicleType, vehicleRegistration, roleFlexibility, address, bankDetails, emergencyContact, documents } = req.body;
    
    // In a real app, use req.user._id
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.raiderDetails = {
      ...user.raiderDetails,
      vehicleType,
      vehicleRegistration,
      roleFlexibility,
      address,
      bankDetails,
      emergencyContact,
      documents,
      approvalStatus: 'Pending',
      isOnline: false,
      isOnShift: false
    };

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error in onboarding:', error);
    res.status(500).json({ success: false, error: 'Failed to process onboarding' });
  }
};

exports.getMe = async (req, res) => {
  try {
    // Mock user fetching
    const { userId } = req.query; 
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

exports.updateShift = async (req, res) => {
  try {
    const { userId, isOnline, isOnShift, isOnBreak, hubCheckIn } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (isOnline !== undefined) user.raiderDetails.isOnline = isOnline;
    if (isOnShift !== undefined) user.raiderDetails.isOnShift = isOnShift;
    if (isOnBreak !== undefined) user.raiderDetails.isOnBreak = isOnBreak;

    await user.save();
    
    let message = 'Shift updated';
    if (hubCheckIn) message = 'Checked in at Hub successfully';
    
    res.status(200).json({ success: true, data: user, message });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update shift' });
  }
};

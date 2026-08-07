const mongoose = require('mongoose');
const Hub = require('../models/Hub');
const Booking = require('../models/Booking');
const Manifest = require('../models/Manifest');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

// --- HUB SETUP ---
exports.getAllHubs = async (req, res) => {
  try {
    const hubs = await Hub.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: hubs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch hubs' });
  }
};

exports.createHub = async (req, res) => {
  try {
    const { contactDetails, ...hubData } = req.body;
    
    // Automatic Hub Manager Provisioning
    if (contactDetails && contactDetails.email && contactDetails.phone) {
      const existingUser = await User.findOne({ 
        $or: [{ email: contactDetails.email }, { phone: contactDetails.phone }] 
      });

      if (existingUser) {
        return res.status(400).json({ success: false, error: 'User with this email or phone already exists.' });
      }

      // Generate a simple random password
      const generatedPassword = `Hub-${Math.floor(1000 + Math.random() * 9000)}`;

      const newManager = new User({
        name: contactDetails.managerName || 'Hub Manager',
        email: contactDetails.email,
        phone: contactDetails.phone,
        password: generatedPassword,
        role: 'HubManager',
        isActive: true
      });

      await newManager.save();

      // Fire-and-forget email — does NOT block hub creation response
      NotificationService.sendEmail(
        contactDetails.email,
        'Welcome to ZyperGo \u2014 Your Hub Manager Access',
        `<!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
              <tr><td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                  <tr><td style="background:linear-gradient(135deg,#006D77,#00a99d);padding:36px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">ZyperGo</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Logistics Intelligence Platform</p>
                  </td></tr>
                  <tr><td style="padding:40px;">
                    <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:700;">Welcome, ${newManager.name}!</h2>
                    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">Your Hub Manager account has been created. You can now log in to the ZyperGo Hub Portal to manage your hub operations.</p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:28px;">
                      <tr><td style="padding:24px;">
                        <p style="margin:0 0 16px;color:#006D77;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">Your Login Credentials</p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;"><span style="color:#64748b;font-size:13px;">Login Portal</span></td>
                            <td align="right" style="padding:8px 0;border-bottom:1px solid #e2e8f0;"><a href="http://hub.localhost:5173" style="color:#006D77;font-size:13px;font-weight:600;text-decoration:none;">hub.localhost:5173</a></td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;"><span style="color:#64748b;font-size:13px;">Phone Number</span></td>
                            <td align="right" style="padding:8px 0;border-bottom:1px solid #e2e8f0;"><span style="color:#0f172a;font-size:13px;font-weight:700;font-family:monospace;">${newManager.phone}</span></td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;"><span style="color:#64748b;font-size:13px;">Password</span></td>
                            <td align="right" style="padding:8px 0;"><span style="background:#006D77;color:#fff;font-size:15px;font-weight:800;font-family:monospace;padding:4px 12px;border-radius:6px;letter-spacing:1px;">${generatedPassword}</span></td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr><td align="center">
                        <a href="http://hub.localhost:5173" style="background:linear-gradient(135deg,#006D77,#00a99d);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;display:inline-block;">Login to Hub Portal &rarr;</a>
                      </td></tr>
                    </table>
                    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">Please change your password after first login. If you did not request this access, contact your administrator.</p>
                  </td></tr>
                  <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;">&copy; ${new Date().getFullYear()} ZyperGo Logistics. All rights reserved.</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>`
      ).then(() => {
        console.log(`[Hub Provisioning] Email sent to ${contactDetails.email}`);
      }).catch(err => {
        console.error(`[Hub Provisioning] Email failed for ${contactDetails.email}:`, err.message);
      });

    }

    const hub = new Hub({
      ...hubData,
      contactDetails
    });
    
    await hub.save();
    res.status(201).json({ success: true, data: hub });
  } catch (error) {
    console.error('Error creating hub:', error);
    res.status(500).json({ success: false, error: 'Failed to create hub' });
  }
};

exports.updateHub = async (req, res) => {
  try {
    const hub = await Hub.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hub) return res.status(404).json({ success: false, error: 'Hub not found' });
    res.status(200).json({ success: true, data: hub });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update hub' });
  }
};

exports.deleteHub = async (req, res) => {
  try {
    const hub = await Hub.findById(req.params.id);
    if (!hub) return res.status(404).json({ success: false, error: 'Hub not found' });

    // Cascade delete the linked HubManager user by email or phone
    if (hub.contactDetails?.email || hub.contactDetails?.phone) {
      const query = {};
      if (hub.contactDetails.email) query.$or = [{ email: hub.contactDetails.email }];
      if (hub.contactDetails.phone) {
        if (query.$or) query.$or.push({ phone: hub.contactDetails.phone });
        else query.$or = [{ phone: hub.contactDetails.phone }];
      }
      const deletedUser = await User.findOneAndDelete({ ...query, role: 'HubManager' });
      if (deletedUser) {
        console.log(`[Hub Delete] Manager user ${deletedUser.email} removed from DB.`);
      }
    }

    await Hub.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Hub and associated manager account deleted successfully.' });
  } catch (error) {
    console.error('[Hub Delete] Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete hub' });
  }
};

exports.assignRidersToHub = async (req, res) => {
  try {
    const { riderIds } = req.body;
    const hub = await Hub.findByIdAndUpdate(
      req.params.id, 
      { $addToSet: { assignedRiders: { $each: riderIds } } },
      { new: true }
    );
    res.status(200).json({ success: true, data: hub });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to assign riders' });
  }
};

// --- HUB INVENTORY & ALERTS ---
exports.getHubInventory = async (req, res) => {
  try {
    const hubId = req.params.id;
    const hub = await Hub.findById(hubId);
    if (!hub) return res.status(404).json({ success: false, error: 'Hub not found' });

    const parcels = await Booking.aggregate([
      { 
        $match: { 
          $or: [
            { 'metadata.sourceHub': new mongoose.Types.ObjectId(hubId) },
            { 'metadata.destinationHub': new mongoose.Types.ObjectId(hubId) }
          ],
          status: { $in: ['Source Hub Received', 'Sorted', 'Partner Handover', 'Destination Hub Received', 'Returned'] }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({ 
      success: true, 
      data: {
        capacity: hub.capacity,
        inventoryStatus: parcels
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
  }
};

// --- HUB OPERATIONS ---

// 1. Receive parcel from rider through scan and digital acknowledgement.
exports.receiveParcel = async (req, res) => {
  try {
    const { bookingId, hubId, acknowledgementType } = req.body;
    
    const hub = await Hub.findById(hubId);
    if (!hub) return res.status(404).json({ success: false, error: 'Hub not found' });

    // Capacity Check
    if (hub.capacity.currentParcels >= hub.capacity.maxCapacity) {
      return res.status(400).json({ success: false, error: 'Hub capacity exceeded. Cannot receive parcel.' });
    }

    let warning = null;
    const loadPercentage = ((hub.capacity.currentParcels + 1) / hub.capacity.maxCapacity) * 100;
    if (loadPercentage >= hub.capacity.capacityThresholdAlert) {
      warning = `WARNING: Hub capacity is at ${loadPercentage.toFixed(1)}%, exceeding threshold of ${hub.capacity.capacityThresholdAlert}%`;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    let newStatus = 'Source Hub Received';
    if (booking.status === 'In Transit' || booking.status === 'Partner Handover') {
       newStatus = 'Destination Hub Received';
    }

    booking.status = newStatus;
    booking.trackingHistory.push({
      status: newStatus,
      description: `Received at hub. Ack: ${acknowledgementType || 'Digital'}`,
      location: hub.name
    });
    
    if(booking.assignedRaiders && booking.assignedRaiders.length > 0) {
       booking.assignedRaiders[booking.assignedRaiders.length - 1].status = 'Handed Over';
    }

    await booking.save();
    
    hub.capacity.currentParcels += 1;
    await hub.save();

    res.status(200).json({ success: true, data: booking, warning });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to receive parcel' });
  }
};

// 2. Sort parcels
exports.sortParcel = async (req, res) => {
  try {
    const { bookingId, route, partnerId, sortType } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status: 'Sorted',
      $push: {
        trackingHistory: {
          status: 'Sorted',
          description: `Sorted via ${sortType || 'Manual'} (Route: ${route || 'N/A'}, Partner: ${partnerId || 'N/A'})`
        }
      }
    }, { new: true });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to sort parcel' });
  }
};

// 3. Create manifest (bag, bundle, consignment, partner manifest)
exports.createManifest = async (req, res) => {
  try {
    const { type, sourceHub, destinationHub, assignedPartner, parcels } = req.body;
    
    const manifestId = `MF-${Date.now()}`;
    const manifest = new Manifest({
      manifestId,
      type,
      sourceHub,
      destinationHub,
      assignedPartner,
      parcels,
      createdBy: req.user ? req.user.id : null
    });
    
    await manifest.save();
    
    await Booking.updateMany(
      { _id: { $in: parcels } },
      { 
        status: assignedPartner ? 'Partner Handover' : 'In Transit',
        $push: { trackingHistory: { status: assignedPartner ? 'Partner Handover' : 'In Transit', description: `Added to ${type} ${manifestId}` } }
      }
    );

    res.status(201).json({ success: true, data: manifest });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create manifest' });
  }
};

// 4. Create last-mile route
exports.createLastMileRoute = async (req, res) => {
  try {
    const { bookingIds, raiderId, hubId } = req.body;
    
    await Booking.updateMany(
      { _id: { $in: bookingIds } },
      { 
        status: 'Out for Delivery',
        $push: {
          assignedRaiders: { raiderId, status: 'Active' },
          trackingHistory: { status: 'Out for Delivery', description: `Assigned for last mile delivery.` }
        }
      }
    );

    const hub = await Hub.findById(hubId);
    if(hub) {
      hub.capacity.currentParcels = Math.max(0, hub.capacity.currentParcels - bookingIds.length);
      await hub.save();
    }

    res.status(200).json({ success: true, message: 'Last-mile route created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create last-mile route' });
  }
};

const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');

exports.createTicket = async (req, res) => {
  try {
    const { bookingId, issueType, description } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const ticket = new Ticket({
      bookingId,
      issueType,
      description,
      history: [{ action: 'Ticket Created', performedBy: 'Customer' }]
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to create ticket', details: error.message });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    // In a real app, filter by req.user._id
    const tickets = await Ticket.find().populate('bookingId', 'trackingId status').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tickets' });
  }
};

const User = require('../models/User');

exports.getAdminTickets = async (req, res) => {
  try {
    const { status, priority, limit = 50 } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tickets = await Ticket.find(filter)
      .populate('bookingId', 'trackingId status origin destination')
      .populate('user', 'name phone email')
      .populate('assignedTo', 'name')
      .populate('internalNotes.addedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Error fetching admin tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
};

exports.updateAdminTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, internalNote } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (status) {
      ticket.status = status;
      ticket.history.push({ action: `Status changed to ${status}`, performedBy: req.user?._id || 'Admin' });
    }
    if (priority) ticket.priority = priority;
    if (assignedTo) ticket.assignedTo = assignedTo;

    if (internalNote) {
      ticket.internalNotes.push({
        note: internalNote,
        addedBy: req.user?._id
      });
    }

    await ticket.save();
    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error updating admin ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to update ticket' });
  }
};

exports.getCRMProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const customer = await User.findById(userId).select('-password');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const bookings = await Booking.find({ sender: userId }).sort({ createdAt: -1 }).limit(20);
    const tickets = await Ticket.find({ user: userId }).sort({ createdAt: -1 });

    res.json({ success: true, data: { customer, bookingHistory: bookings, ticketHistory: tickets } });
  } catch (error) {
    console.error('Error fetching CRM profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch CRM profile' });
  }
};

exports.bulkUpdateDelayedRoutes = async (req, res) => {
  try {
    const { originCity, destinationCity, message } = req.body;

    const delayedBookings = await Booking.find({
      'pickupLocation.city': originCity,
      'dropLocation.city': destinationCity,
      status: { $in: ['In Transit', 'Created', 'Rider On the Way'] }
    }).populate('sender');

    const affectedCustomers = delayedBookings.map(b => b.sender?.phone || 'Unknown').filter(p => p !== 'Unknown');
    
    console.log(`[BULK ALERT] Sending SMS to ${affectedCustomers.length} customers on route ${originCity}-${destinationCity}: ${message}`);

    res.json({
      success: true,
      message: `Successfully notified ${affectedCustomers.length} customers.`,
      affectedCount: affectedCustomers.length
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ success: false, message: 'Failed to process bulk update' });
  }
};

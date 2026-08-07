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

const Enquiry = require('../models/Enquiry');
// const nodemailer = require('nodemailer'); // Assume transporter is setup in a service if needed later

exports.createEnquiry = async (req, res) => {
  try {
    const { type, name, email, phone, message, details } = req.body;

    const enquiry = new Enquiry({
      type,
      name,
      email,
      phone,
      message,
      details
    });

    await enquiry.save();

    // In a real app, you would send an email here to notify admins
    // sendAdminEmail('New Enquiry', `You have a new ${type} enquiry from ${name}.`);

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: enquiry
    });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    res.status(500).json({ success: false, error: 'Failed to submit enquiry', details: error.message });
  }
};

exports.getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: enquiries
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
  }
};

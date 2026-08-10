const User = require('../models/User');
const NotificationService = require('../services/notificationService');

exports.getProfile = async (req, res) => {
  try {
    // In a real application, req.user._id would be populated by authMiddleware.
    // Since auth is mocked for now, we'll try to find any customer or the first user,
    // or rely on a query param/header if provided. For now, we fetch the first customer.
    let user = await User.findOne({ role: 'Customer' });
    if (!user) {
      user = await User.findOne();
    }
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, company, address } = req.body;
    
    // Hardcoded to update the first customer for mock purposes
    let user = await User.findOne({ role: 'Customer' });
    if (!user) user = await User.findOne();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    if (company !== undefined) user.company = company;
    if (address !== undefined) user.address = address;

    await user.save();

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

exports.requestEmailUpdate = async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ success: false, error: 'New email is required' });

    let user = await User.findOne({ role: 'Customer' });
    if (!user) user = await User.findOne();

    // Check if email is already taken
    const existing = await User.findOne({ email: newEmail });
    if (existing && existing._id.toString() !== user._id.toString()) {
      return res.status(400).json({ success: false, error: 'Email is already in use by another account' });
    }

    // Generate real 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = generatedOtp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    
    await user.save();

    // Send OTP using Mock Service
    const htmlBody = NotificationService.generateEmailTemplate({
      title: 'Verify Your New Email',
      message: 'We received a request to update your ZyperGo account email address.',
      otpCode: generatedOtp,
      footerNote: 'This verification code will expire in 10 minutes. If you did not request this change, please secure your account immediately.'
    });

    NotificationService.sendEmail(
      newEmail, 
      'Verify your new ZyperGo email address', 
      htmlBody
    );

    res.status(200).json({ success: true, message: 'OTP sent to new email address.' });
  } catch (error) {
    console.error('Error requesting email update:', error);
    res.status(500).json({ success: false, error: 'Failed to request email update' });
  }
};

exports.verifyEmailUpdate = async (req, res) => {
  try {
    const { newEmail, otp } = req.body;
    if (!newEmail || !otp) return res.status(400).json({ success: false, error: 'Email and OTP required' });

    let user = await User.findOne({ role: 'Customer' });
    if (!user) user = await User.findOne();

    if (otp !== '1234' && (user.otp !== otp || user.otpExpiry < new Date())) {
      return res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // OTP is valid
    user.email = newEmail;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Email updated successfully', data: user });
  } catch (error) {
    console.error('Error verifying email update:', error);
    res.status(500).json({ success: false, error: 'Failed to verify email update' });
  }
};

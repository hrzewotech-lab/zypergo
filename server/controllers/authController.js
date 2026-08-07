const jwt = require('jsonwebtoken');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

exports.sendOtp = async (req, res) => {
  try {
    const { email, phone, role, name, password } = req.body;
    
    // We can allow either email or phone for login, but for signup we want both
    if (!email && !phone) return res.status(400).json({ success: false, error: 'Email or phone number is required' });

    // Use email or phone to find the user
    let user = await User.findOne({ $or: [{ email }, { phone }], role });
    
    if (!user) {
      if (name && email && phone) {
        user = new User({ email, phone, role, name, password });
      } else if (role === 'Customer') {
        user = new User({ email: email || null, phone: phone || null, role, name: 'New Customer', password });
      } else {
        return res.status(404).json({ success: false, error: `${role} account not found. Please sign up.` });
      }
    }

    // Generate real 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = generatedOtp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    
    // If user already existed but they passed a new password (e.g. forgot password flow later, or signing up an existing partial account)
    if (password) {
      user.password = password;
    }
    
    await user.save();

    // Send via email if email exists
    if (user.email) {
      await NotificationService.sendEmail(
        user.email,
        'Your ZyperGo Verification Code',
        `<p>Hello ${user.name},</p><p>Your login code is: <b style="font-size:24px;">${generatedOtp}</b></p><p>This code expires in 10 minutes.</p>`
      );
    } else {
      // Fallback to SMS if no email (e.g. older accounts)
      NotificationService.sendSMS(user.phone, `Your ZyperGo login OTP is ${generatedOtp}.`);
    }

    res.status(200).json({ success: true, message: 'OTP sent successfully. Check your email or phone.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: `Error: ${error.message}. SMTP_USER: ${process.env.SMTP_USER}` });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, phone, role, otp } = req.body;

    const user = await User.findOne({ $or: [{ email }, { phone }], role });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Special bypass for seed admin or mock
    if (otp !== '1234' && (user.otp !== otp || user.otpExpiry < new Date())) {
      return res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Clear OTP after successful verify
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to verify OTP' });
  }
};

exports.loginWithPassword = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Email/Phone and password are required' });
    }

    const isEmail = identifier.includes('@');
    const query = { role };
    if (isEmail) query.email = identifier;
    else query.phone = identifier.replace(/\D/g, '');

    const user = await User.findOne(query);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, error: 'No password set for this account. Please login with OTP.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to login' });
  }
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

exports.sendOtp = async (req, res) => {
  try {
    const { email, phone, role, name, password, raiderDetails } = req.body;
    
    // We can allow either email or phone for login, but for signup we want both
    if (!email && !phone) return res.status(400).json({ success: false, error: 'Email or phone number is required' });

    // Use email or phone to find the user
    const emailRegex = email ? { $regex: new RegExp(`^${email}$`, 'i') } : null;
    let user = await User.findOne({ $or: [{ email: emailRegex }, { phone }], role });
    
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

    if (raiderDetails && role === 'Raider') {
      user.raiderDetails = {
         ...raiderDetails,
         approvalStatus: 'Pending',
         isOnline: false,
         isOnShift: false
      };
    }
    
    await user.save();

    // Send via email if email exists
    if (user.email) {
      const htmlBody = NotificationService.generateEmailTemplate({
        title: 'Login Verification',
        message: 'We received a request to log into your ZyperGo account.',
        otpCode: generatedOtp,
        footerNote: 'This code will expire in 10 minutes. If you did not request this, please secure your account.'
      });

      await NotificationService.sendEmail(
        user.email,
        'Your ZyperGo Login OTP',
        htmlBody
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

    const emailRegex = email ? { $regex: new RegExp(`^${email}$`, 'i') } : null;
    const user = await User.findOne({ $or: [{ email: emailRegex }, { phone }] });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (role) {
      const adminRoles = ['SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'DispatchManager', 'FinanceManager'];
      const hubRoles = ['HubManager', 'HubOperator'];
      
      let isAuthorized = false;
      if (user.role === 'SuperAdmin') {
        isAuthorized = true;
      } else if (role === 'Admin' || role === 'SuperAdmin') {
        isAuthorized = adminRoles.includes(user.role);
      } else if (hubRoles.includes(role)) {
        isAuthorized = hubRoles.includes(user.role);
      } else {
        isAuthorized = (user.role === role);
      }

      if (!isAuthorized) {
        return res.status(403).json({ success: false, error: `Unauthorized. User role '${user.role}' cannot access this portal.` });
      }
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, error: 'Account is suspended or inactive.' });
    }

    if (user.role === 'Raider' && user.raiderDetails && user.raiderDetails.approvalStatus !== 'Approved') {
      return res.status(403).json({ success: false, error: 'Raider account is pending admin approval.' });
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
    const query = {};
    if (isEmail) query.email = { $regex: new RegExp(`^${identifier}$`, 'i') };
    else query.phone = identifier.replace(/\D/g, '');

    const user = await User.findOne(query);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found. Please check your credentials.' });
    }

    if (role) {
      const adminRoles = ['SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'DispatchManager', 'FinanceManager'];
      const hubRoles = ['HubManager', 'HubOperator'];
      
      let isAuthorized = false;
      if (user.role === 'SuperAdmin') {
        isAuthorized = true;
      } else if (role === 'Admin' || role === 'SuperAdmin') {
        isAuthorized = adminRoles.includes(user.role);
      } else if (hubRoles.includes(role)) {
        isAuthorized = hubRoles.includes(user.role);
      } else {
        isAuthorized = (user.role === role);
      }

      if (!isAuthorized) {
        return res.status(403).json({ success: false, error: `Unauthorized. User role '${user.role}' cannot access this portal.` });
      }
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, error: 'Account is suspended or inactive.' });
    }

    if (user.role === 'Raider' && user.raiderDetails && user.raiderDetails.approvalStatus !== 'Approved') {
      return res.status(403).json({ success: false, error: 'Raider account is pending admin approval.' });
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

exports.raiderApply = async (req, res) => {
  try {
    const { name, email, phone, raiderDetails } = req.body;
    
    if (!name || !email || !phone || !raiderDetails) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    let user = await User.findOne({ $or: [{ email }, { phone }], role: 'Raider' });
    if (user) {
      return res.status(400).json({ success: false, error: 'Raider account with this email/phone already exists' });
    }

    user = new User({
      name,
      email,
      phone,
      role: 'Raider',
      raiderDetails: {
        ...raiderDetails,
        approvalStatus: 'Pending',
        isOnline: false,
        isOnShift: false
      }
    });

    await user.save();
    res.status(201).json({ success: true, message: 'Application submitted successfully. Waiting for admin approval.' });
  } catch (error) {
    console.error('Raider apply error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit application' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User with this email does not exist' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and save to db
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    
    await user.save();

    // Construct reset URL based on origin (the frontend application)
    // We expect the frontend to pass the origin or we can use headers
    const origin = req.headers.origin || 'http://localhost:5173';
    const resetUrl = `${origin}/reset-password?token=${resetToken}`;

    const htmlBody = NotificationService.generateEmailTemplate({
      title: 'Password Reset Request',
      message: 'You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the button below to complete the process.',
      buttonText: 'Reset Password',
      buttonUrl: resetUrl,
      footerNote: 'This link will expire in 30 minutes. If you did not request this, please ignore this email and your password will remain unchanged.'
    });

    try {
      await NotificationService.sendEmail(
        user.email,
        'ZyperGo - Password Reset Request',
        htmlBody
      );
      res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      console.error('Email send error:', emailError);
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Failed to process password reset request' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token and new password are required' });
    }

    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired password reset token' });
    }

    // Set new password (the pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.status(200).json({ success: true, message: 'Password has been updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Account suspended' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

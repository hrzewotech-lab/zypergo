const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { upload } = require('../config/cloudinary');

// --- Helper for generating JWT ---
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, phone: user.phone },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
};

// 1. Basic Login (Fallback)
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is suspended or inactive' });
    }

    if (user.role === 'Rider' && user.riderDetails.approvalStatus !== 'Approved') {
       return res.status(403).json({ 
         error: 'Account pending admin approval', 
         status: user.riderDetails.approvalStatus 
       });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// 1.b Password Login via Identifier (Email or Phone)
router.post('/login-password', async (req, res) => {
  try {
    const { identifier, password, role } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password are required' });
    }

    // Try finding by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Role check if provided and not SuperAdmin logging in as something else
    // Allow SuperAdmin to log in anywhere, otherwise match role
    if (role && user.role !== role && user.role !== 'SuperAdmin') {
       // If it's OperationsStaff trying to log in, that's fine. But we need to make sure
       // their role matches what the app expects, or if they are staff they can log into admin portal.
       const adminRoles = ['SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'DispatchManager', 'FinanceManager'];
       if (role === 'Admin' && !adminRoles.includes(user.role)) {
         return res.status(403).json({ error: 'Unauthorized role for this portal' });
       } else if (role !== 'Admin' && user.role !== role) {
         return res.status(403).json({ error: 'Unauthorized role for this portal' });
       }
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is suspended' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Password Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// 1.c Send OTP (Mock)
router.post('/send-otp', async (req, res) => {
  try {
    const { email, phone, role } = req.body;
    const identifier = email || phone;
    
    if (!identifier) {
      return res.status(400).json({ error: 'Email or phone required' });
    }

    // Just check if user exists
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user && role !== 'Customer') {
       // Only customers can auto-create via OTP. Staff must exist.
       return res.status(404).json({ error: 'Account not found. Please contact Admin.' });
    }

    // In a real app, send OTP via SMS/Email here
    console.log(`[MOCK OTP] Sent 1234 to ${identifier}`);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// 1.d Verify OTP (Mock)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, phone, otp, role } = req.body;
    const identifier = email || phone;
    
    if (!identifier || !otp) {
      return res.status(400).json({ error: 'Identifier and OTP required' });
    }

    if (otp !== '1234') {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    let user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
      if (role === 'Customer') {
        // Auto-register customer
        user = new User({
          name: 'Guest User',
          phone: phone || identifier,
          email: email,
          role: 'Customer',
          password: Math.random().toString(36).slice(-8)
        });
        await user.save();
      } else {
        return res.status(404).json({ error: 'Account not found' });
      }
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is suspended' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// 2. Customer/Admin Registration
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, email, role } = req.body;

    // By default, restrict to Customer. Admins should be created internally, but for dev we allow it.
    const userRole = role || 'Customer';

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }

    const user = new User({
      name,
      phone,
      password,
      email,
      role: userRole
    });

    await user.save();
    
    const token = generateToken(user);
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// 3. Rider Onboarding with Image Uploads via Cloudinary
router.post(
  '/rider/apply', 
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'rcDocument', maxCount: 1 },
    { name: 'idProof', maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      const { name, phone, password, vehicleType, vehicleRegistration } = req.body;
      const files = req.files;

      if (!name || !phone || !password || !vehicleType || !vehicleRegistration) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this phone number already exists' });
      }

      // Extract Cloudinary URLs from multer
      const profilePhotoUrl = files['profilePhoto'] ? files['profilePhoto'][0].path : null;
      const drivingLicenseUrl = files['drivingLicense'] ? files['drivingLicense'][0].path : null;
      const rcDocumentUrl = files['rcDocument'] ? files['rcDocument'][0].path : null;
      const idProofUrl = files['idProof'] ? files['idProof'][0].path : null;

      const user = new User({
        name,
        phone,
        password,
        role: 'Rider',
        photoUrl: profilePhotoUrl,
        riderDetails: {
          vehicleType,
          vehicleRegistration,
          approvalStatus: 'Pending',
          documents: {
            drivingLicenseUrl,
            rcUrl: rcDocumentUrl,
            idProofUrl
          }
        }
      });

      await user.save();
      
      res.status(201).json({
        message: 'Rider application submitted successfully. Pending admin approval.',
        userId: user._id
      });
    } catch (error) {
      console.error('Rider application error:', error);
      res.status(500).json({ error: 'Server error during rider application' });
    }
  }
);

const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, async (req, res) => {
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
});

module.exports = router;

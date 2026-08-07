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

// 1. Basic Login (Phone + Password for now, can be OTP later)
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

    if (user.role === 'Raider' && user.raiderDetails.approvalStatus !== 'Approved') {
       return res.status(403).json({ 
         error: 'Account pending admin approval', 
         status: user.raiderDetails.approvalStatus 
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

// 3. Raider Onboarding with Image Uploads via Cloudinary
router.post(
  '/raider/apply', 
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
        role: 'Raider',
        photoUrl: profilePhotoUrl,
        raiderDetails: {
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
        message: 'Raider application submitted successfully. Pending admin approval.',
        userId: user._id
      });
    } catch (error) {
      console.error('Raider application error:', error);
      res.status(500).json({ error: 'Server error during raider application' });
    }
  }
);

module.exports = router;

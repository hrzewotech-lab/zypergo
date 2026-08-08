const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }
    
    // req.file.path contains the Cloudinary URL
    res.status(200).json({ success: true, url: req.file.path });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ success: false, error: 'Failed to upload image' });
  }
});

module.exports = router;

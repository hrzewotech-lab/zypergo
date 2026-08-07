const express = require('express');
const router = express.Router();
const Address = require('../models/Address');

// Get all addresses for a user
router.get('/:userId', async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching addresses' });
  }
});

// Add a new address
router.post('/', async (req, res) => {
  try {
    const newAddress = new Address(req.body);
    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (err) {
    console.error('Error creating address:', err);
    res.status(500).json({ error: 'Failed to create address' });
  }
});

// Update an address
router.put('/:id', async (req, res) => {
  try {
    const updatedAddress = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAddress) return res.status(404).json({ error: 'Address not found' });
    res.json(updatedAddress);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// Delete an address
router.delete('/:id', async (req, res) => {
  try {
    const deletedAddress = await Address.findByIdAndDelete(req.params.id);
    if (!deletedAddress) return res.status(404).json({ error: 'Address not found' });
    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

module.exports = router;

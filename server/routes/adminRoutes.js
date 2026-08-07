const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/bookings', adminController.getAllBookings);
router.put('/bookings/:id', adminController.updateBookingAdmin);

router.get('/partners', adminController.getPartners);
router.post('/partners', adminController.createPartner);

router.post('/broadcast', adminController.sendBroadcast);

module.exports = router;

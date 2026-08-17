const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const pricingController = require('../controllers/pricingController');

// In a real application, these would be protected by an auth middleware
// router.use(authMiddleware);

router.post('/', bookingController.createBooking);
router.post('/estimate', pricingController.calculatePrice);
router.get('/my-shipments', bookingController.getMyBookings);
router.get('/my-bookings', bookingController.getMyBookings);
router.get('/:id', bookingController.getBookingDetails);
router.post('/:id/cancel', bookingController.cancelBooking);

module.exports = router;

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// In a real application, these would be protected by an auth middleware
// router.use(authMiddleware);

router.post('/', bookingController.createBooking);
router.get('/my-shipments', bookingController.getMyBookings);
router.get('/:id', bookingController.getBookingDetails);
router.post('/:id/cancel', bookingController.cancelBooking);

module.exports = router;

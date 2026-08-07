const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAction } = require('../middleware/auditMiddleware');

// All admin routes must be authenticated
router.use(protect);

// Dashboard - Broad access
router.get('/dashboard-stats', authorize('SuperAdmin', 'OperationsAdmin', 'FinanceManager', 'HubManager', 'DispatchManager'), adminController.getDashboardStats);

// Bookings
router.get('/bookings', authorize('SuperAdmin', 'OperationsAdmin', 'HubManager', 'HubOperator', 'DispatchManager', 'SupportExecutive', 'Auditor'), adminController.getAllBookings);
router.put('/bookings/:id', authorize('SuperAdmin', 'OperationsAdmin', 'HubManager', 'DispatchManager', 'SupportExecutive'), logAction('Booking'), adminController.updateBookingAdmin);

// Partners
router.get('/partners', authorize('SuperAdmin', 'OperationsAdmin', 'PartnerManager', 'FinanceManager'), adminController.getPartners);
router.post('/partners', authorize('SuperAdmin', 'OperationsAdmin', 'PartnerManager'), logAction('Partner'), adminController.createPartner);

// Users
router.post('/users', authorize('SuperAdmin'), logAction('User'), adminController.createUser);

// Broadcast
router.post('/broadcast', authorize('SuperAdmin', 'OperationsAdmin'), logAction('Broadcast'), adminController.sendBroadcast);

module.exports = router;

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
router.put('/bookings/:id/assign-raider', authorize('SuperAdmin', 'OperationsAdmin', 'DispatchManager', 'HubManager'), logAction('Booking'), adminController.assignRaider);
router.put('/bookings/:id/transit-log', authorize('SuperAdmin', 'OperationsAdmin', 'DispatchManager', 'HubManager'), logAction('Booking'), adminController.logTransit);
router.get('/raiders/available', authorize('SuperAdmin', 'OperationsAdmin', 'DispatchManager', 'HubManager'), adminController.getAvailableRaiders);

// Partners
router.get('/partners', authorize('SuperAdmin', 'OperationsAdmin', 'PartnerManager', 'FinanceManager'), adminController.getPartners);
router.post('/partners', authorize('SuperAdmin', 'OperationsAdmin', 'PartnerManager'), logAction('Partner'), adminController.createPartner);

// Users
router.post('/users', authorize('SuperAdmin'), logAction('User'), adminController.createUser);

// Broadcast
router.post('/broadcast', authorize('SuperAdmin', 'OperationsAdmin'), logAction('Broadcast'), adminController.sendBroadcast);

// Raider Approvals
router.get('/raiders', authorize('SuperAdmin', 'OperationsAdmin'), adminController.getRaiders);
router.put('/raiders/:id/approve', authorize('SuperAdmin', 'OperationsAdmin'), adminController.approveRaider);

module.exports = router;

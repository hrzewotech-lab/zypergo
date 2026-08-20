const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAction } = require('../middleware/auditMiddleware');

// All admin routes must be authenticated
router.use(protect);

// Dashboard - Broad access
router.get('/dashboard-stats', authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'FinanceManager', 'HubManager', 'DispatchManager'), adminController.getDashboardStats);

// Bookings
router.get('/bookings', authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'HubOperator', 'DispatchManager', 'SupportExecutive', 'Auditor', 'Rider'), adminController.getAllBookings);
router.put('/bookings/:id', authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'DispatchManager', 'SupportExecutive', 'Rider'), logAction('Booking'), adminController.updateBookingAdmin);
router.put('/bookings/:id/assign-rider', authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'DispatchManager', 'HubManager', 'Rider'), logAction('Booking'), adminController.assignRider);
router.put('/bookings/:id/transit-log', authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'DispatchManager', 'HubManager', 'Rider'), logAction('Booking'), adminController.logTransit);
router.get('/riders/available', authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'DispatchManager', 'HubManager'), adminController.getAvailableRiders);

// Partners
router.get('/partners', authorize('SuperAdmin', 'OperationsAdmin', 'PartnerManager', 'FinanceManager'), adminController.getPartners);
router.post('/partners', authorize('SuperAdmin', 'OperationsAdmin', 'PartnerManager'), logAction('Partner'), adminController.createPartner);

// Users
router.post('/users', authorize('SuperAdmin'), logAction('User'), adminController.createUser);

// Broadcast
router.post('/broadcast', authorize('SuperAdmin', 'OperationsAdmin'), logAction('Broadcast'), adminController.sendBroadcast);

// Rider Approvals
router.get('/riders', authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff'), adminController.getRiders);
router.put('/riders/:id/approve', authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff'), adminController.approveRider);

module.exports = router;

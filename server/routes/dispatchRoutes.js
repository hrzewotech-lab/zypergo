const express = require('express');
const router = express.Router();
const dc = require('../controllers/dispatchController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAction } = require('../middleware/auditMiddleware');

router.use(protect);

const DISPATCH_ROLES = ['SuperAdmin', 'OperationsAdmin', 'DispatchManager'];
const VIEW_ROLES = [...DISPATCH_ROLES, 'HubManager', 'Auditor'];

// Pending queues
router.get('/pending/pickups', authorize(...VIEW_ROLES), dc.getPendingPickups);
router.get('/pending/deliveries', authorize(...VIEW_ROLES), dc.getPendingDeliveries);

// Available riders
router.get('/riders/available', authorize(...VIEW_ROLES), dc.getAvailableRiders);

// Auto-assign
router.post('/auto-assign/pickup', authorize(...DISPATCH_ROLES), logAction('Dispatch'), dc.autoAssignPickup);
router.post('/auto-assign/lastmile', authorize(...DISPATCH_ROLES), logAction('Dispatch'), dc.autoAssignLastMile);

// Manual override
router.post('/manual-assign', authorize(...DISPATCH_ROLES), logAction('Dispatch'), dc.manualAssign);

// Partner routing
router.post('/recommend-partners', authorize(...VIEW_ROLES), dc.recommendPartners);
router.post('/assign-partner', authorize(...DISPATCH_ROLES), logAction('Dispatch'), dc.assignPartner);

// Route grouping
router.get('/group-routes', authorize(...VIEW_ROLES), dc.groupRoutes);

// Dispatch rules config
router.get('/rules', authorize('SuperAdmin', 'OperationsAdmin'), dc.getDispatchRules);
router.put('/rules', authorize('SuperAdmin', 'OperationsAdmin'), logAction('DispatchRule'), dc.updateDispatchRules);

module.exports = router;

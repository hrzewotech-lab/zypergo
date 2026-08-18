const express = require('express');
const router = express.Router();
const hubController = require('../controllers/hubController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAction } = require('../middleware/auditMiddleware');

// All hub routes must be authenticated
router.use(protect);

// --- HUB SETUP (SuperAdmin, OperationsAdmin) ---
router.get('/', authorize('SuperAdmin', 'OperationsAdmin', 'HubManager', 'HubOperator'), hubController.getAllHubs);
router.get('/destinations', authorize('SuperAdmin', 'OperationsAdmin', 'HubManager', 'HubOperator'), hubController.getDestinationHubs);
router.post('/', authorize('SuperAdmin', 'OperationsAdmin'), logAction('Hub'), hubController.createHub);
router.put('/:id', authorize('SuperAdmin', 'OperationsAdmin'), logAction('Hub'), hubController.updateHub);
router.delete('/:id', authorize('SuperAdmin', 'OperationsAdmin'), logAction('Hub'), hubController.deleteHub);
router.post('/:id/riders', authorize('SuperAdmin', 'OperationsAdmin', 'HubManager'), logAction('Hub'), hubController.assignRidersToHub);

// --- HUB INVENTORY ---
router.get('/:id/inventory', authorize('SuperAdmin', 'OperationsAdmin', 'HubManager', 'HubOperator'), hubController.getHubInventory);
router.get('/:id/records', authorize('SuperAdmin', 'OperationsAdmin', 'HubManager', 'HubOperator'), hubController.getHubRecords);

// --- HUB OPERATIONS (HubManager, HubOperator) ---
router.post('/receive', authorize('HubManager', 'HubOperator'), logAction('Booking'), hubController.receiveParcel);
router.post('/sort', authorize('HubManager', 'HubOperator'), logAction('Booking'), hubController.sortParcel);
router.post('/manifest', authorize('HubManager', 'HubOperator'), logAction('Manifest'), hubController.createManifest);
router.post('/last-mile', authorize('HubManager', 'HubOperator', 'DispatchManager'), logAction('Booking'), hubController.createLastMileRoute);

module.exports = router;

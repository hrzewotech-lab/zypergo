const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAction } = require('../middleware/auditMiddleware');

router.use(protect);

// Main scan endpoint — Hub operators, managers, dispatch
router.post(
  '/',
  authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'HubOperator', 'DispatchManager'),
  logAction('Scan'),
  scanController.processscan
);

// Scan history for a specific parcel
router.get(
  '/history/:trackingId',
  authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'HubOperator', 'DispatchManager', 'Auditor', 'SupportExecutive'),
  scanController.getScanHistory
);

// Unscanned alerts — parcels stuck at a checkpoint
router.get(
  '/alerts/unscanned',
  authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'DispatchManager'),
  scanController.getUnscannedAlerts
);

// All scan events with filters
router.get(
  '/',
  authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'Auditor'),
  scanController.getAllScans
);

module.exports = router;

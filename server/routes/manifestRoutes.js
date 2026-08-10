const express = require('express');
const router = express.Router();
const manifestController = require('../controllers/manifestController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAction } = require('../middleware/auditMiddleware');

router.use(protect);

// Create manifest
router.post(
  '/',
  authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'HubOperator', 'DispatchManager'),
  logAction('Manifest'),
  manifestController.createManifest
);

// Get all manifests (with filters)
router.get(
  '/',
  authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'HubOperator', 'DispatchManager', 'Auditor'),
  manifestController.getAllManifests
);

// Get single manifest (detailed)
router.get(
  '/:id',
  authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'HubOperator', 'DispatchManager', 'Auditor'),
  manifestController.getManifestById
);

// Get manifest PDF data
router.get(
  '/:id/pdf',
  authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'HubOperator', 'DispatchManager'),
  manifestController.getManifestPdfData
);

// Seal manifest
router.put(
  '/:id/seal',
  authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager'),
  logAction('Manifest'),
  manifestController.sealManifest
);

// Dispatch manifest
router.put(
  '/:id/dispatch',
  authorize('SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'DispatchManager'),
  logAction('Manifest'),
  manifestController.dispatchManifest
);

module.exports = router;

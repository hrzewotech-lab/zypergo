const express = require('express');
const router = express.Router();
const sc = require('../controllers/serviceabilityController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAction } = require('../middleware/auditMiddleware');

// Public endpoints
router.post('/check', sc.checkServiceability);
router.get('/check-pincode/:pincode', sc.checkPincodePublic);
router.get('/cities-summary', sc.getCitiesSummary);

// Protected Admin routes
router.use(protect);
const ADMIN_ROLES = ['SuperAdmin', 'OperationsAdmin'];

// Rules
router.get('/rules', authorize(...ADMIN_ROLES), sc.getRules);
router.post('/rules', authorize(...ADMIN_ROLES), logAction('ServiceabilityRule'), sc.createRule);
router.put('/rules/:id', authorize(...ADMIN_ROLES), logAction('ServiceabilityRule'), sc.updateRule);
router.delete('/rules/:id', authorize(...ADMIN_ROLES), logAction('ServiceabilityRule'), sc.deleteRule);

// Serviceable Locations (Allowlist Matrix: City & Pincodes)
router.get('/locations', authorize(...ADMIN_ROLES), sc.getLocations);
router.post('/locations', authorize(...ADMIN_ROLES), logAction('ServiceableLocation'), sc.addLocation);
router.post('/locations/bulk', authorize(...ADMIN_ROLES), logAction('ServiceableLocation'), sc.bulkAddLocations);
router.post('/locations/seed-defaults', authorize(...ADMIN_ROLES), logAction('ServiceableLocation'), sc.seedDefaultLocations);
router.put('/locations/:id', authorize(...ADMIN_ROLES), logAction('ServiceableLocation'), sc.updateLocation);
router.patch('/locations/:id/toggle', authorize(...ADMIN_ROLES), logAction('ServiceableLocation'), sc.toggleLocationStatus);
router.delete('/locations/:id', authorize(...ADMIN_ROLES), logAction('ServiceableLocation'), sc.removeLocation);

module.exports = router;

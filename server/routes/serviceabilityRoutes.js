const express = require('express');
const router = express.Router();
const sc = require('../controllers/serviceabilityController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAction } = require('../middleware/auditMiddleware');

// Public or Authenticated user check for booking flow
// (Can be used by customer app without strict admin roles)
router.post('/check', sc.checkServiceability);

// Admin routes for managing rules
router.use(protect);
const ADMIN_ROLES = ['SuperAdmin', 'OperationsAdmin'];

router.get('/rules', authorize(...ADMIN_ROLES), sc.getRules);
router.post('/rules', authorize(...ADMIN_ROLES), logAction('ServiceabilityRule'), sc.createRule);
router.put('/rules/:id', authorize(...ADMIN_ROLES), logAction('ServiceabilityRule'), sc.updateRule);
router.delete('/rules/:id', authorize(...ADMIN_ROLES), logAction('ServiceabilityRule'), sc.deleteRule);

module.exports = router;

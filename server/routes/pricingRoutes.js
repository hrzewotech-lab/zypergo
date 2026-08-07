const express = require('express');
const router = express.Router();
const pc = require('../controllers/pricingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAction } = require('../middleware/auditMiddleware');

router.use(protect);

const ADMIN_ROLES = ['SuperAdmin', 'OperationsAdmin', 'FinanceManager'];

router.get('/rules', authorize(...ADMIN_ROLES), pc.getRules);
router.post('/rules', authorize(...ADMIN_ROLES), logAction('PricingRule'), pc.createRule);
router.put('/rules/:id', authorize(...ADMIN_ROLES), logAction('PricingRule'), pc.updateRule);
router.delete('/rules/:id', authorize(...ADMIN_ROLES), logAction('PricingRule'), pc.deleteRule);

// Calculation / Simulation engine
router.post('/calculate', authorize(...ADMIN_ROLES, 'HubManager', 'DispatchManager'), pc.calculatePrice);
router.post('/preview', authorize(...ADMIN_ROLES), pc.calculatePrice); // Same logic, used by Simulator

module.exports = router;

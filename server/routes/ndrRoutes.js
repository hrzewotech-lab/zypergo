const express = require('express');
const router = express.Router();
const nc = require('../controllers/ndrController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAction } = require('../middleware/auditMiddleware');

router.use(protect);
const ADMIN_ROLES = ['SuperAdmin', 'OperationsAdmin', 'SupportExecutive', 'HubManager'];

router.get('/', authorize(...ADMIN_ROLES), nc.getNDRs);
router.post('/raise', authorize(...ADMIN_ROLES, 'HubOperator'), logAction('ExceptionNDR'), nc.raiseNDR);
router.put('/:id/resolve', authorize(...ADMIN_ROLES), logAction('ExceptionNDR'), nc.resolveNDR);
router.get('/aging', authorize(...ADMIN_ROLES), nc.getAgingReport);

module.exports = router;

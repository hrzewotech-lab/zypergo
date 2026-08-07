const express = require('express');
const router = express.Router();
const fc = require('../controllers/financeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAction } = require('../middleware/auditMiddleware');

router.use(protect);
const FINANCE_ROLES = ['SuperAdmin', 'FinanceManager', 'OperationsAdmin', 'Auditor'];

// Customer Finance
router.get('/transactions', authorize(...FINANCE_ROLES), fc.getTransactions);
router.post('/refund', authorize('SuperAdmin', 'FinanceManager'), logAction('Transaction'), fc.processRefund);

// Rider Cash & Hub Operations
router.get('/cod-tracking', authorize(...FINANCE_ROLES, 'HubManager'), fc.getPendingCOD);
router.post('/deposit', authorize('SuperAdmin', 'FinanceManager', 'HubManager'), logAction('Settlement'), fc.logDeposit);

// Partner Settlements
router.get('/settlements', authorize(...FINANCE_ROLES), fc.getSettlements);
router.post('/payout', authorize('SuperAdmin', 'FinanceManager'), logAction('Settlement'), fc.logPayout);

// Reports
router.get('/reports', authorize(...FINANCE_ROLES), fc.getReports);

module.exports = router;

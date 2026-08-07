const express = require('express');
const router = express.Router();
const ac = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
const ANALYTICS_ROLES = ['SuperAdmin', 'OperationsAdmin', 'FinanceManager', 'Auditor'];

router.get('/kpis', authorize(...ANALYTICS_ROLES), ac.getDashboardKPIs);
router.get('/charts/weekly', authorize(...ANALYTICS_ROLES), ac.getWeeklyChartData);
router.get('/export/:type', authorize(...ANALYTICS_ROLES), ac.exportCSV);

module.exports = router;

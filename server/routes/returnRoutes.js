const express = require('express');
const router = express.Router();
const rc = require('../controllers/returnController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAction } = require('../middleware/auditMiddleware');

router.use(protect);
const ADMIN_ROLES = ['SuperAdmin', 'OperationsAdmin', 'HubManager', 'DispatchManager'];

router.get('/', authorize(...ADMIN_ROLES), rc.getReturns);
router.post('/initiate', authorize(...ADMIN_ROLES), logAction('ReturnRequest'), rc.initiateReturn);
router.put('/:id/status', authorize(...ADMIN_ROLES), logAction('ReturnRequest'), rc.updateReturnStatus);
router.post('/:id/pod', authorize(...ADMIN_ROLES), logAction('ReturnRequest'), rc.captureReturnPOD);

module.exports = router;

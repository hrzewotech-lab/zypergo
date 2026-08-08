const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

router.post('/tickets', supportController.createTicket);
router.get('/tickets', supportController.getMyTickets);

// --- Admin CRM & Support Routes ---
// In a real application, these would be protected by the `protect` and `authorize('SuperAdmin', 'SupportExecutive', ...)` middlewares.
router.get('/admin/tickets', supportController.getAdminTickets);
router.put('/admin/tickets/:id', supportController.updateAdminTicket);
router.get('/admin/crm/:userId', supportController.getCRMProfile);
router.post('/admin/bulk-update', supportController.bulkUpdateDelayedRoutes);

module.exports = router;

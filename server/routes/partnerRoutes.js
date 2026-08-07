const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');

router.get('/shipments', partnerController.getAssignedShipments);
router.post('/shipments/scan', partnerController.scanShipment);
router.post('/shipments/update-status', partnerController.updateShipmentStatus);

module.exports = router;

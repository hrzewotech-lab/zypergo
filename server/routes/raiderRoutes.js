const express = require('express');
const router = express.Router();
const raiderController = require('../controllers/raiderController');

router.get('/jobs', raiderController.getAvailableJobs);
router.post('/jobs/:id/accept', raiderController.acceptJob);
router.post('/jobs/:id/update-status', raiderController.updateJobStatus);
router.post('/jobs/:id/transhipment', raiderController.handleTranshipment);

router.post('/shift', raiderController.toggleShift);

module.exports = router;

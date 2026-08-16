const express = require('express');
const router = express.Router();
const raiderController = require('../controllers/raiderController');

router.get('/jobs', raiderController.getAvailableJobs);
router.post('/jobs/:id/accept', raiderController.acceptJob);
router.post('/jobs/:id/update-status', raiderController.updateJobStatus);
router.post('/jobs/:id/transhipment', raiderController.handleTranshipment);
router.post('/jobs/:id/accept-handover', raiderController.acceptHandover);

router.post('/shift', raiderController.updateShift);
router.post('/onboard', raiderController.onboardRaider);
router.get('/me', raiderController.getMe);

module.exports = router;

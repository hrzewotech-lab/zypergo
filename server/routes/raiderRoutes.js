const express = require('express');
const router = express.Router();
const raiderController = require('../controllers/raiderController');

router.get('/jobs', raiderController.getAvailableJobs);
router.post('/jobs/:id/accept', raiderController.acceptJob);
router.post('/jobs/:id/update-status', raiderController.updateJobStatus);
router.post('/jobs/:id/transhipment', raiderController.handleTranshipment);
router.post('/jobs/:id/accept-handover', raiderController.acceptHandover);

router.post('/jobs/:id/verify-otp', raiderController.verifyOtp);
router.post('/shift', raiderController.updateShift);
router.post('/location', raiderController.updateLocation);
router.post('/onboard', raiderController.onboardRaider);
router.post('/withdraw', raiderController.withdrawEarnings);
router.get('/me', raiderController.getMe);
router.get('/history', raiderController.getHistory);

module.exports = router;

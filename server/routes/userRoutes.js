const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/request-email-update', userController.requestEmailUpdate);
router.post('/verify-email-update', userController.verifyEmailUpdate);

module.exports = router;

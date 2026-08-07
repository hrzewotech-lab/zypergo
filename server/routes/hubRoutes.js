const express = require('express');
const router = express.Router();
const hubController = require('../controllers/hubController');

router.post('/scan', hubController.scanManifest);
router.post('/complete', hubController.completeLoading);

module.exports = router;

const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

router.post('/tickets', supportController.createTicket);
router.get('/tickets', supportController.getMyTickets);

module.exports = router;

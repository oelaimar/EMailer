const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/stats', auth, roleCheck('dashboard', 'read'), dashboardController.getStats);
router.get('/charts', auth, roleCheck('dashboard', 'read'), dashboardController.getCharts);

module.exports = router;

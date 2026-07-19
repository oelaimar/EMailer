const express = require('express');
const router = express.Router();
const controller = require('../controllers/statisticsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/full-report', auth, roleCheck('statistics', 'read'), controller.getFullReport);
router.get('/advanced-report', auth, roleCheck('statistics', 'read'), controller.getAdvancedReport);

module.exports = router;

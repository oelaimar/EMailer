const express = require('express');
const router = express.Router();
const controller = require('../controllers/logController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/backend', auth, roleCheck('logs', 'read'), controller.getBackendLogs);
router.get('/frontend', auth, roleCheck('logs', 'read'), controller.getFrontendLogs);
router.post('/frontend', controller.createFrontendLog);
router.delete('/frontend', auth, roleCheck('logs', 'delete'), controller.clearFrontendLogs);

module.exports = router;

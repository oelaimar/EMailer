const express = require('express');
const router = express.Router();
const sessionsController = require('../controllers/sessionsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('sessions', 'read'), sessionsController.list);
router.post('/force-disconnect', auth, roleCheck('sessions', 'delete'), sessionsController.forceDisconnect);

module.exports = router;

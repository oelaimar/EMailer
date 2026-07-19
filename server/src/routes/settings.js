const express = require('express');
const router = express.Router();
const controller = require('../controllers/settingController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('settings', 'read'), controller.getAll);
router.put('/', auth, roleCheck('settings', 'write'), controller.update);
router.get('/:key', auth, roleCheck('settings', 'read'), controller.get);

module.exports = router;

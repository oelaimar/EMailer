const express = require('express');
const router = express.Router();
const controller = require('../controllers/toolController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/spf-check', auth, roleCheck('tools', 'read'), controller.spfCheck);
router.post('/blacklist-check', auth, roleCheck('tools', 'read'), controller.blacklistCheck);
router.post('/extract-values', auth, roleCheck('tools', 'read'), controller.extractValues);
router.post('/extract-mailbox', auth, roleCheck('tools', 'read'), controller.extractMailbox);

module.exports = router;

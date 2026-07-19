const express = require('express');
const router = express.Router();
const controller = require('../controllers/postmasterController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/sources', auth, roleCheck('postmaster-dashboard', 'read'), controller.getSources);
router.post('/messages', auth, roleCheck('postmaster-dashboard', 'read'), controller.getMessages);
router.post('/refresh', auth, roleCheck('postmaster-dashboard', 'write'), controller.refreshMailbox);
router.get('/messages/:id/detail', auth, roleCheck('postmaster-dashboard', 'read'), controller.getMessageDetail);
router.post('/messages/delete', auth, roleCheck('postmaster-dashboard', 'delete'), controller.deleteMessages);
router.post('/export', auth, roleCheck('postmaster-dashboard', 'read'), controller.exportReplyAccounts);
router.get('/runs', auth, roleCheck('postmaster-dashboard', 'read'), controller.getRuns);
router.get('/runs/:id/logs', auth, roleCheck('postmaster-dashboard', 'read'), controller.getRunLogs);
router.post('/:id/test-connection', auth, roleCheck('postmaster-dashboard', 'read'), controller.testConnection);

module.exports = router;

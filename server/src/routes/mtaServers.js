const express = require('express');
const router = express.Router();
const controller = require('../controllers/mtaServerController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('mta-servers', 'read'), controller.list);
router.get('/:id', auth, roleCheck('mta-servers', 'read'), controller.getById);
router.post('/', auth, roleCheck('mta-servers', 'write'), controller.create);
router.put('/:id', auth, roleCheck('mta-servers', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('mta-servers', 'delete'), controller.remove);
router.post('/:id/check', auth, roleCheck('mta-servers', 'write'), controller.check);
router.post('/bulk-check', auth, roleCheck('mta-servers', 'write'), controller.bulkCheck);
router.post('/bulk-action', auth, roleCheck('mta-servers', 'delete'), controller.bulkAction);
router.post('/:id/install', auth, roleCheck('mta-install', 'write'), controller.beginInstallation);
router.get('/:id/install-logs', auth, roleCheck('mta-install', 'read'), controller.getInstallationLogs);
router.post('/:id/configure-ips', auth, roleCheck('mta-ips', 'write'), controller.configureIps);
router.post('/:id/extract-rdns', auth, roleCheck('mta-ips', 'write'), controller.extractRdns);
router.post('/:id/generate-dkim', auth, roleCheck('mta-servers', 'write'), controller.generateDkim);
router.post('/bulk-install', auth, roleCheck('mta-install', 'write'), controller.beginBulkInstallation);
router.post('/bulk-install-logs', auth, roleCheck('mta-install', 'read'), controller.getBulkInstallationLogs);

module.exports = router;

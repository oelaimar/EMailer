const express = require('express');
const router = express.Router();
const controller = require('../controllers/proxyController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('mta-proxies', 'read'), controller.list);
router.get('/by-type/:type', auth, roleCheck('mta-proxies', 'read'), controller.listByType);
router.get('/:id', auth, roleCheck('mta-proxies', 'read'), controller.getById);
router.post('/', auth, roleCheck('mta-proxies', 'write'), controller.create);
router.put('/:id', auth, roleCheck('mta-proxies', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('mta-proxies', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('mta-proxies', 'delete'), controller.bulkAction);
router.post('/install', auth, roleCheck('mta-proxies', 'write'), controller.installOnServers);

module.exports = router;

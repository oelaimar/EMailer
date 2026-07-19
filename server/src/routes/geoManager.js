const express = require('express');
const router = express.Router();
const controller = require('../controllers/geoManagerController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('geo-manager', 'read'), controller.list);
router.get('/:id', auth, roleCheck('geo-manager', 'read'), controller.getById);
router.post('/', auth, roleCheck('geo-manager', 'write'), controller.create);
router.put('/:id/start', auth, roleCheck('geo-manager', 'write'), controller.start);
router.put('/:id/stop', auth, roleCheck('geo-manager', 'write'), controller.stop);
router.delete('/:id', auth, roleCheck('geo-manager', 'delete'), controller.remove);
router.get('/:id/logs', auth, roleCheck('geo-manager', 'read'), controller.getLogs);
router.post('/bulk-action', auth, roleCheck('geo-manager', 'delete'), controller.bulkAction);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/virtualListProcessController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('virtual-lists', 'read'), controller.list);
router.get('/:id', auth, roleCheck('virtual-lists', 'read'), controller.getById);
router.post('/', auth, roleCheck('virtual-lists', 'write'), controller.create);
router.post('/:id/start', auth, roleCheck('virtual-lists', 'write'), controller.startProcess);
router.post('/:id/stop', auth, roleCheck('virtual-lists', 'write'), controller.stopProcess);
router.delete('/:id', auth, roleCheck('virtual-lists', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('virtual-lists', 'delete'), controller.bulkAction);

module.exports = router;

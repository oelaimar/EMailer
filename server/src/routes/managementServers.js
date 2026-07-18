const express = require('express');
const router = express.Router();
const controller = require('../controllers/managementServerController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('mgmt-servers-add', 'read'), controller.list);
router.get('/:id', auth, roleCheck('mgmt-servers-add', 'read'), controller.getById);
router.post('/', auth, roleCheck('mgmt-servers-add', 'write'), controller.create);
router.put('/:id', auth, roleCheck('mgmt-servers-add', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('mgmt-servers-add', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('mgmt-servers-add', 'delete'), controller.bulkAction);

module.exports = router;

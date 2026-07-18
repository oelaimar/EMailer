const express = require('express');
const router = express.Router();
const controller = require('../controllers/serverProviderController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('servers-providers-add', 'read'), controller.list);
router.get('/:id', auth, roleCheck('servers-providers-add', 'read'), controller.getById);
router.post('/', auth, roleCheck('servers-providers-add', 'write'), controller.create);
router.put('/:id', auth, roleCheck('servers-providers-add', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('servers-providers-add', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('servers-providers-add', 'delete'), controller.bulkAction);
router.post('/bulk-add', auth, roleCheck('servers-providers-add', 'write'), controller.bulkAdd);

module.exports = router;

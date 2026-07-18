const express = require('express');
const router = express.Router();
const controller = require('../controllers/dataProviderController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('data-providers', 'read'), controller.list);
router.get('/:id', auth, roleCheck('data-providers', 'read'), controller.getById);
router.post('/', auth, roleCheck('data-providers', 'write'), controller.create);
router.put('/:id', auth, roleCheck('data-providers', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('data-providers', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('data-providers', 'delete'), controller.bulkAction);
router.post('/bulk-add', auth, roleCheck('data-providers', 'write'), controller.bulkAdd);

module.exports = router;

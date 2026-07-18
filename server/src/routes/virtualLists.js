const express = require('express');
const router = express.Router();
const controller = require('../controllers/virtualListController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('virtual-lists', 'read'), controller.list);
router.get('/:id', auth, roleCheck('virtual-lists', 'read'), controller.getById);
router.post('/', auth, roleCheck('virtual-lists', 'write'), controller.create);
router.put('/:id', auth, roleCheck('virtual-lists', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('virtual-lists', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('virtual-lists', 'delete'), controller.bulkAction);

module.exports = router;

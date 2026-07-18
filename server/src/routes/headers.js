const express = require('express');
const router = express.Router();
const controller = require('../controllers/headerController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('headers', 'read'), controller.list);
router.get('/:id', auth, roleCheck('headers', 'read'), controller.getById);
router.post('/', auth, roleCheck('headers', 'write'), controller.create);
router.put('/:id', auth, roleCheck('headers', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('headers', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('headers', 'delete'), controller.bulkAction);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/ispController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('isps', 'read'), controller.list);
router.get('/:id', auth, roleCheck('isps', 'read'), controller.getById);
router.post('/', auth, roleCheck('isps', 'write'), controller.create);
router.put('/:id', auth, roleCheck('isps', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('isps', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('isps', 'delete'), controller.bulkAction);
router.post('/bulk-add', auth, roleCheck('isps', 'write'), controller.bulkAdd);

module.exports = router;

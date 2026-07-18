const express = require('express');
const router = express.Router();
const controller = require('../controllers/autoResponderController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('auto-responders', 'read'), controller.list);
router.get('/:id', auth, roleCheck('auto-responders', 'read'), controller.getById);
router.post('/', auth, roleCheck('auto-responders', 'write'), controller.create);
router.put('/:id', auth, roleCheck('auto-responders', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('auto-responders', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('auto-responders', 'delete'), controller.bulkAction);

module.exports = router;

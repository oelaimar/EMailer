const express = require('express');
const router = express.Router();
const controller = require('../controllers/verticalController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('verticals', 'read'), controller.list);
router.get('/:id', auth, roleCheck('verticals', 'read'), controller.getById);
router.post('/', auth, roleCheck('verticals', 'write'), controller.create);
router.put('/:id', auth, roleCheck('verticals', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('verticals', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('verticals', 'delete'), controller.bulkAction);

module.exports = router;

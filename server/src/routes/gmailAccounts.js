const express = require('express');
const router = express.Router();
const controller = require('../controllers/gmailAccountController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('gmail-accounts', 'read'), controller.list);
router.get('/:id', auth, roleCheck('gmail-accounts', 'read'), controller.getById);
router.post('/', auth, roleCheck('gmail-accounts', 'write'), controller.create);
router.put('/:id', auth, roleCheck('gmail-accounts', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('gmail-accounts', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('gmail-accounts', 'delete'), controller.bulkAction);

module.exports = router;

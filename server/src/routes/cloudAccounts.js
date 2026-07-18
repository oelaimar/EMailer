const express = require('express');
const router = express.Router();
const controller = require('../controllers/cloudAccountController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('aws-accounts', 'read'), controller.list);
router.get('/by-provider/:provider', auth, roleCheck('aws-accounts', 'read'), controller.listByProvider);
router.get('/:id', auth, roleCheck('aws-accounts', 'read'), controller.getById);
router.post('/', auth, roleCheck('aws-accounts', 'write'), controller.create);
router.put('/:id', auth, roleCheck('aws-accounts', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('aws-accounts', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('aws-accounts', 'delete'), controller.bulkAction);

module.exports = router;

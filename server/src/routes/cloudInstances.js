const express = require('express');
const router = express.Router();
const controller = require('../controllers/cloudInstanceController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('aws-instances', 'read'), controller.list);
router.get('/:id', auth, roleCheck('aws-instances', 'read'), controller.getById);
router.post('/', auth, roleCheck('aws-instances', 'write'), controller.create);
router.put('/:id', auth, roleCheck('aws-instances', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('aws-instances', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('aws-instances', 'delete'), controller.bulkAction);

module.exports = router;

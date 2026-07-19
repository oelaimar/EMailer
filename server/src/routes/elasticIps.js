const express = require('express');
const router = express.Router();
const controller = require('../controllers/elasticIpController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('aws-instances', 'read'), controller.list);
router.get('/:id', auth, roleCheck('aws-instances', 'read'), controller.getById);
router.post('/', auth, roleCheck('aws-instances', 'write'), controller.create);
router.post('/allocate', auth, roleCheck('aws-instances', 'write'), controller.allocate);
router.post('/release', auth, roleCheck('aws-instances', 'delete'), controller.release);
router.delete('/:id', auth, roleCheck('aws-instances', 'delete'), controller.remove);

module.exports = router;

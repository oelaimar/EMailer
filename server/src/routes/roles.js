const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('roles', 'read'), roleController.list);
router.post('/', auth, roleCheck('roles', 'write'), roleController.create);
router.get('/:id', auth, roleCheck('roles', 'read'), roleController.getById);
router.put('/:id', auth, roleCheck('roles', 'write'), roleController.update);
router.delete('/:id', auth, roleCheck('roles', 'delete'), roleController.remove);
router.get('/:id/users', auth, roleCheck('roles', 'read'), roleController.getRoleUsers);
router.post('/affect', auth, roleCheck('roles', 'write'), roleController.affectRoleToUsers);
router.post('/users', auth, roleCheck('roles', 'write'), roleController.affectRolesToUser);

module.exports = router;

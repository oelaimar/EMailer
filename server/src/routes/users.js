const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('users', 'read'), userController.list);
router.post('/', auth, roleCheck('users', 'write'), userController.create);
router.get('/:id', auth, roleCheck('users', 'read'), userController.getById);
router.put('/:id', auth, roleCheck('users', 'write'), userController.update);
router.delete('/:id', auth, roleCheck('users', 'delete'), userController.remove);

module.exports = router;

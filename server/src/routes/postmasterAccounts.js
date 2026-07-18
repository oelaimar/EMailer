const express = require('express');
const router = express.Router();
const controller = require('../controllers/postmasterAccountController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('postmaster-dashboard', 'read'), controller.list);
router.get('/:id', auth, roleCheck('postmaster-dashboard', 'read'), controller.getById);
router.post('/', auth, roleCheck('postmaster-dashboard', 'write'), controller.create);
router.put('/:id', auth, roleCheck('postmaster-dashboard', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('postmaster-dashboard', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('postmaster-dashboard', 'delete'), controller.bulkAction);

module.exports = router;

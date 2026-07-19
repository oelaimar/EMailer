const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('teams', 'read'), controller.list);
router.get('/:id', auth, roleCheck('teams', 'read'), controller.getById);
router.post('/', auth, roleCheck('teams', 'write'), controller.create);
router.put('/:id', auth, roleCheck('teams', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('teams', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('teams', 'delete'), controller.bulkAction);
router.get('/:id/users', auth, roleCheck('teams', 'read'), controller.getUsers);
router.post('/users', auth, roleCheck('teams', 'write'), controller.setUsers);
router.get('/:id/authorizations', auth, roleCheck('teams', 'read'), controller.getAuthorizations);
router.post('/authorizations', auth, roleCheck('teams', 'write'), controller.setAuthorizations);

module.exports = router;

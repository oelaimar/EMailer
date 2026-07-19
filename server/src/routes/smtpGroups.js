const express = require('express');
const router = express.Router();
const controller = require('../controllers/smtpGroupController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('smtp-groups', 'read'), controller.list);
router.get('/:id', auth, roleCheck('smtp-groups', 'read'), controller.getById);
router.post('/', auth, roleCheck('smtp-groups', 'write'), controller.create);
router.put('/:id', auth, roleCheck('smtp-groups', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('smtp-groups', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('smtp-groups', 'delete'), controller.bulkAction);

router.get('/:id/vmtas', auth, roleCheck('smtp-groups', 'read'), controller.listCustomVmtas);
router.post('/:id/vmtas', auth, roleCheck('smtp-groups', 'write'), controller.addCustomVmta);
router.delete('/:id/vmtas/:vmtaId', auth, roleCheck('smtp-groups', 'delete'), controller.deleteCustomVmta);

module.exports = router;

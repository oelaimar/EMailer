const express = require('express');
const router = express.Router();
const smtpServerController = require('../controllers/smtpServerController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('smtp-list', 'read'), smtpServerController.list);
router.post('/', auth, roleCheck('smtp-add', 'write'), smtpServerController.create);
router.get('/:id', auth, roleCheck('smtp-list', 'read'), smtpServerController.getById);
router.put('/:id', auth, roleCheck('smtp-add', 'write'), smtpServerController.update);
router.delete('/:id', auth, roleCheck('smtp-add', 'delete'), smtpServerController.remove);
router.post('/:id/check', auth, roleCheck('smtp-list', 'write'), smtpServerController.check);
router.post('/bulk-check', auth, roleCheck('smtp-bulk-check', 'write'), smtpServerController.bulkCheck);
router.post('/bulk-action', auth, roleCheck('smtp-list', 'delete'), smtpServerController.bulkAction);

module.exports = router;

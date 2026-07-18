const express = require('express');
const router = express.Router();
const controller = require('../controllers/mailboxController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('mailboxes', 'read'), controller.list);
router.get('/domains', auth, roleCheck('mailboxes', 'read'), controller.listDomains);
router.get('/:id', auth, roleCheck('mailboxes', 'read'), controller.getById);
router.post('/', auth, roleCheck('mailboxes', 'write'), controller.create);
router.put('/:id', auth, roleCheck('mailboxes', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('mailboxes', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('mailboxes', 'delete'), controller.bulkAction);

module.exports = router;

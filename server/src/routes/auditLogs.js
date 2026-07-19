const express = require('express');
const router = express.Router();
const controller = require('../controllers/auditLogController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('audit-logs', 'read'), controller.list);
router.get('/:id', auth, roleCheck('audit-logs', 'read'), controller.getById);
router.post('/', auth, roleCheck('audit-logs', 'write'), controller.create);
router.delete('/:id', auth, roleCheck('audit-logs', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('audit-logs', 'delete'), controller.bulkAction);

module.exports = router;

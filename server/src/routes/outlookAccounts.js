const express = require('express');
const router = express.Router();
const controller = require('../controllers/outlookAccountController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('outlook-accounts', 'read'), controller.list);
router.get('/:id', auth, roleCheck('outlook-accounts', 'read'), controller.getById);
router.post('/', auth, roleCheck('outlook-accounts', 'write'), controller.create);
router.put('/:id', auth, roleCheck('outlook-accounts', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('outlook-accounts', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('outlook-accounts', 'delete'), controller.bulkAction);

router.get('/send-process-data', auth, roleCheck('outlook-accounts', 'read'), controller.sendProcessData);
router.get('/drops', auth, roleCheck('outlook-accounts', 'read'), controller.listDrops);
router.get('/tests', auth, roleCheck('outlook-accounts', 'read'), controller.listTests);

module.exports = router;

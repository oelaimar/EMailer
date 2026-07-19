const express = require('express');
const router = express.Router();
const controller = require('../controllers/gSuiteAccountController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('gsuite-accounts', 'read'), controller.list);
router.get('/:id', auth, roleCheck('gsuite-accounts', 'read'), controller.getById);
router.post('/', auth, roleCheck('gsuite-accounts', 'write'), controller.create);
router.put('/:id', auth, roleCheck('gsuite-accounts', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('gsuite-accounts', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('gsuite-accounts', 'delete'), controller.bulkAction);

router.get('/send-process-data', auth, roleCheck('gsuite-accounts', 'read'), controller.sendProcessData);
router.get('/drops', auth, roleCheck('gsuite-accounts', 'read'), controller.listDrops);
router.get('/tests', auth, roleCheck('gsuite-accounts', 'read'), controller.listTests);

module.exports = router;

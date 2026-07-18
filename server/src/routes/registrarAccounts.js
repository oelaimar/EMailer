const express = require('express');
const router = express.Router();
const controller = require('../controllers/registrarAccountController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('cloudflare-accounts', 'read'), controller.list);
router.get('/by-registrar/:registrar', auth, roleCheck('cloudflare-accounts', 'read'), controller.listByRegistrar);
router.get('/:id', auth, roleCheck('cloudflare-accounts', 'read'), controller.getById);
router.post('/', auth, roleCheck('cloudflare-accounts', 'write'), controller.create);
router.put('/:id', auth, roleCheck('cloudflare-accounts', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('cloudflare-accounts', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('cloudflare-accounts', 'delete'), controller.bulkAction);

module.exports = router;

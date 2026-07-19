const express = require('express');
const router = express.Router();
const controller = require('../controllers/domainController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('domains', 'read'), controller.list);
router.get('/:id', auth, roleCheck('domains', 'read'), controller.getById);
router.post('/', auth, roleCheck('domains', 'write'), controller.create);
router.put('/:id', auth, roleCheck('domains', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('domains', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('domains', 'delete'), controller.bulkAction);
router.get('/:id/records', auth, roleCheck('domains', 'read'), controller.getRecords);
router.post('/:id/records', auth, roleCheck('domains', 'write'), controller.setRecords);

router.get('/brands', auth, roleCheck('domains', 'read'), controller.listBrands);
router.post('/brands', auth, roleCheck('domains', 'write'), controller.createBrand);
router.delete('/brands/:id', auth, roleCheck('domains', 'delete'), controller.deleteBrand);
router.get('/subdomains', auth, roleCheck('domains', 'read'), controller.listSubdomains);
router.post('/subdomains', auth, roleCheck('domains', 'write'), controller.createSubdomain);
router.delete('/subdomains/:id', auth, roleCheck('domains', 'delete'), controller.deleteSubdomain);

module.exports = router;

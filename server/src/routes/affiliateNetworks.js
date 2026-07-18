const express = require('express');
const router = express.Router();
const controller = require('../controllers/affiliateNetworkController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('affiliate-networks', 'read'), controller.list);
router.get('/:id', auth, roleCheck('affiliate-networks', 'read'), controller.getById);
router.post('/', auth, roleCheck('affiliate-networks', 'write'), controller.create);
router.put('/:id', auth, roleCheck('affiliate-networks', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('affiliate-networks', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('affiliate-networks', 'delete'), controller.bulkAction);

module.exports = router;

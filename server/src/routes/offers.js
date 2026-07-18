const express = require('express');
const router = express.Router();
const controller = require('../controllers/offerController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('offers', 'read'), controller.list);
router.get('/:id', auth, roleCheck('offers', 'read'), controller.getById);
router.post('/', auth, roleCheck('offers', 'write'), controller.create);
router.put('/:id', auth, roleCheck('offers', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('offers', 'delete'), controller.remove);
router.post('/bulk-action', auth, roleCheck('offers', 'delete'), controller.bulkAction);
router.get('/:id/suppression', auth, roleCheck('offers', 'read'), controller.listSuppression);
router.post('/:id/suppression', auth, roleCheck('offers', 'write'), controller.addSuppression);
router.delete('/:id/suppression/:suppressionId', auth, roleCheck('offers', 'delete'), controller.removeSuppression);

module.exports = router;

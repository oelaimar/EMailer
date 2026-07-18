const express = require('express');
const router = express.Router();
const controller = require('../controllers/productionController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('production', 'read'), controller.listProductions);
router.get('/:id', auth, roleCheck('production', 'read'), controller.getProduction);
router.post('/', auth, roleCheck('production', 'write'), controller.createProduction);
router.put('/:id', auth, roleCheck('production', 'write'), controller.updateProduction);
router.delete('/:id', auth, roleCheck('production', 'delete'), controller.removeProduction);
router.get('/:id/processes', auth, roleCheck('production', 'read'), controller.listProcesses);
router.post('/:id/processes', auth, roleCheck('production', 'write'), controller.createProcess);
router.put('/:id/processes/:processId', auth, roleCheck('production', 'write'), controller.updateProcess);
router.delete('/:id/processes/:processId', auth, roleCheck('production', 'delete'), controller.removeProcess);

module.exports = router;

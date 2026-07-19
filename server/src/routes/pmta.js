const express = require('express');
const router = express.Router();
const controller = require('../controllers/pmtaController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/commands', auth, roleCheck('pmta', 'read'), controller.listCommands);
router.post('/commands', auth, roleCheck('pmta', 'write'), controller.createCommand);

router.get('/schedules', auth, roleCheck('pmta', 'read'), controller.listSchedules);
router.post('/schedules', auth, roleCheck('pmta', 'write'), controller.createSchedule);
router.put('/schedules/:id/stop', auth, roleCheck('pmta', 'write'), controller.stopSchedule);
router.delete('/schedules/:id', auth, roleCheck('pmta', 'delete'), controller.deleteSchedule);

router.get('/templates', auth, roleCheck('pmta', 'read'), controller.listTemplates);
router.post('/templates', auth, roleCheck('pmta', 'write'), controller.createTemplate);
router.put('/templates/:id', auth, roleCheck('pmta', 'write'), controller.updateTemplate);
router.delete('/templates/:id', auth, roleCheck('pmta', 'delete'), controller.deleteTemplate);

router.get('/vmtas', auth, roleCheck('pmta', 'read'), controller.listVmtas);
router.post('/vmtas', auth, roleCheck('pmta', 'write'), controller.createVmta);
router.delete('/vmtas/:id', auth, roleCheck('pmta', 'delete'), controller.deleteVmta);

router.get('/configs', auth, roleCheck('pmta', 'read'), controller.listConfigs);
router.put('/configs/:id', auth, roleCheck('pmta', 'write'), controller.updateConfig);
router.get('/history', auth, roleCheck('pmta', 'read'), controller.listHistory);

router.get('/server-names', auth, roleCheck('pmta', 'read'), controller.getServerNames);
router.post('/vmtas/create-rotation', auth, roleCheck('pmta', 'write'), controller.createServerVmtas);
router.post('/vmtas/reset', auth, roleCheck('pmta', 'write'), controller.resetServerVmtas);

module.exports = router;

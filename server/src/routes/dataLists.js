const express = require('express');
const router = express.Router();
const controller = require('../controllers/dataListController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

router.get('/', auth, roleCheck('data-lists', 'read'), controller.list);
router.get('/:id', auth, roleCheck('data-lists', 'read'), controller.getById);
router.post('/', auth, roleCheck('data-lists', 'write'), controller.create);
router.put('/:id', auth, roleCheck('data-lists', 'write'), controller.update);
router.delete('/:id', auth, roleCheck('data-lists', 'delete'), controller.remove);
router.post('/upload', auth, roleCheck('data-lists', 'write'), upload.single('file'), controller.upload);
router.post('/bulk-action', auth, roleCheck('data-lists', 'delete'), controller.bulkAction);

router.get('/blacklists', auth, roleCheck('data-lists', 'read'), controller.listBlacklists);
router.post('/blacklists', auth, roleCheck('data-lists', 'write'), controller.createBlacklist);
router.delete('/blacklists/:id', auth, roleCheck('data-lists', 'delete'), controller.deleteBlacklist);
router.get('/:id/download', auth, roleCheck('data-lists', 'read'), controller.downloadList);
router.post('/fetch-emails', auth, roleCheck('data-lists', 'write'), controller.fetchEmails);

module.exports = router;

const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/dashboard', require('./dashboard'));
router.use('/users', require('./users'));
router.use('/roles', require('./roles'));
router.use('/smtp-servers', require('./smtpServers'));
router.use('/sessions', require('./sessions'));
router.use('/mta-servers', require('./mtaServers'));
router.use('/domains', require('./domains'));
router.use('/data-lists', require('./dataLists'));
router.use('/smtp-groups', require('./smtpGroups'));

module.exports = router;

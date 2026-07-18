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
router.use('/offers', require('./offers'));
router.use('/affiliate-networks', require('./affiliateNetworks'));
router.use('/auto-responders', require('./autoResponders'));
router.use('/virtual-lists', require('./virtualLists'));
router.use('/production', require('./production'));
router.use('/gmail-accounts', require('./gmailAccounts'));
router.use('/gsuite-accounts', require('./gsuiteAccounts'));
router.use('/outlook-accounts', require('./outlookAccounts'));

module.exports = router;

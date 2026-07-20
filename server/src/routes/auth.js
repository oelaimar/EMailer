const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

router.get('/me', authenticate, authController.me);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refresh);

module.exports = router;

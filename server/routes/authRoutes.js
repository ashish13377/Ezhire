const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/getUserData', authController.authenticateToken, authController.getUserData);

module.exports = router;

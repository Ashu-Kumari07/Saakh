const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Vendor authentication via Phone OTP
router.post('/vendor/send-otp', authController.vendorSendOtp);
router.post('/vendor/verify-otp', authController.vendorVerifyOtp);

// Lender authentication via Email + Password
router.post('/lender/login', authController.lenderLogin);
router.post('/lender/register', authController.lenderRegister);

// Current user profile
router.get('/me', authenticate, authController.getMe);

module.exports = router;

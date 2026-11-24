const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Vendor authentication via Phone OTP & Firebase
router.post('/vendor/send-otp', authController.vendorSendOtp);
router.post('/vendor/verify-otp', authController.vendorVerifyOtp);
router.post('/vendor/firebase-login', authController.vendorFirebaseLogin);
router.post('/vendor/profile', authenticate, authController.updateVendorProfile);

// Lender authentication via Email + Password
router.post('/lender/login', authController.lenderLogin);
router.post('/lender/register', authController.lenderRegister);

// Current user profile
router.get('/me', authenticate, authController.getMe);

module.exports = router;

const express = require('express');
const router = express.Router();
const fraudController = require('../controllers/fraudController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Scan vendor for fraud risks
router.get('/scan/:vendorId', fraudController.scanVendor);

// Get stored flags
router.get('/flags/:vendorId', fraudController.getVendorFlags);

module.exports = router;

const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const { requireVendor, authenticate } = require('../middleware/auth');

// Vendor score endpoint (real-time underwriting calculation)
router.get('/score', requireVendor, incomeController.getVendorScore);

// Underwriting analysis endpoint
router.get('/underwrite/:vendorId', authenticate, incomeController.getUnderwriting);

module.exports = router;

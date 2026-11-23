const express = require('express');
const router = express.Router();
const lenderController = require('../controllers/lenderController');
const { requireLender } = require('../middleware/auth');

// All lender operations require lender authentication
router.use(requireLender);

router.get('/applications', lenderController.getApplications);
router.get('/vendors/:vendorId', lenderController.getVendorReview);

module.exports = router;

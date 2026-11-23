const express = require('express');
const router = express.Router();
const consentController = require('../controllers/consentController');
const { requireVendor } = require('../middleware/auth');

// All consent operations require vendor authentication
router.use(requireVendor);

router.get('/status', consentController.getConsentStatus);
router.post('/grant', consentController.grantConsent);
router.post('/revoke', consentController.revokeConsent);
router.get('/access-log', consentController.getAccessLog);
router.get('/requests', consentController.getPendingRequests);

module.exports = router;

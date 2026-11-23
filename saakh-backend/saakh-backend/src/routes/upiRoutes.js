const express = require('express');
const router = express.Router();
const upiController = require('../controllers/upiController');
const { requireVendor } = require('../middleware/auth');

router.use(requireVendor);

router.post('/upload-statement', upiController.uploadStatement);
router.get('/transactions', upiController.getTransactions);

module.exports = router;

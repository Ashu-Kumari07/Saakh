const express = require('express');
const router = express.Router();
const multer = require('multer');
const ocrController = require('../controllers/ocrController');
const { requireVendor } = require('../middleware/auth');

// In-memory buffer upload for receipt image
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireVendor);

// POST /api/ocr/scan - OCR extraction for bill receipts and supplier invoices
router.post('/scan', upload.single('receipt'), ocrController.scanReceipt);

module.exports = router;

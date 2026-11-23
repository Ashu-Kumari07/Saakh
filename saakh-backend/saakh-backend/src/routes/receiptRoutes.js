const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('node:path');
const receiptController = require('../controllers/receiptController');
const { requireVendor } = require('../middleware/auth');

// Setup multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.use(requireVendor);

router.post('/upload', upload.single('receipt'), receiptController.uploadReceipt);
router.get('/', receiptController.getReceipts);

module.exports = router;

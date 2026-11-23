const express = require('express');
const router = express.Router();
const multer = require('multer');
const voiceController = require('../controllers/voiceController');
const { requireVendor } = require('../middleware/auth');

// In-memory buffer upload for audio stream
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireVendor);

// POST /api/voice/parse - Transcribe & extract items/rates from speech/text
router.post('/parse', upload.single('audio'), voiceController.parseVoice);

// POST /api/voice/save - Save confirmed entry with audio proof link
router.post('/save', voiceController.saveConfirmedVoice);

module.exports = router;

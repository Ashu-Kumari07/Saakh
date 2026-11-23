const OCRService = require('../services/ocrService');

// 1. Scan Receipt Image & Extract Financial Text
exports.scanReceipt = async (req, res, next) => {
    try {
        const imageBuffer = req.file ? req.file.buffer : null;
        const filename = req.file ? req.file.originalname : 'receipt.jpg';
        const simulatedText = req.body.raw_text || null;

        const result = await OCRService.processReceiptImage(imageBuffer, filename, simulatedText);

        return res.json({
            success: true,
            extracted: {
                supplierName: result.supplierName,
                billNumber: result.billNumber,
                billDate: result.billDate,
                amount: result.amount,
                rawText: result.rawText,
                imagePath: result.imagePath,
                confidence: result.confidence
            }
        });
    } catch (err) {
        next(err);
    }
};

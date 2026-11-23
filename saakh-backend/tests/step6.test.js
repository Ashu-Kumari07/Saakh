const assert = require('node:assert');
const path = require('node:path');
const db = require('../src/config/db');
const VoiceService = require('../src/services/voiceService');
const OCRService = require('../src/services/ocrService');
const voiceController = require('../src/controllers/voiceController');
const ocrController = require('../src/controllers/ocrController');

// Test Mock Helper
function createMockRes() {
    return {
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.data = data;
            return this;
        }
    };
}

async function runStep6Tests() {
    console.log('--- RUNNING SAAKH STEP 6 TESTS (VOICE PARSING & RECEIPT OCR) ---');

    const vendorId = 'v_ramesh_01';

    // Test 1: English Voice Sentence Parsing
    console.log('\n[Test 1] Voice NLP: Parsing spoken English sentence...');
    const engInput = 'Sold three packets of chips, twenty rupees each';
    const engParsed = VoiceService.parseSentence(engInput);

    assert.strictEqual(engParsed.type, 'Sale', 'Should detect type as Sale');
    assert.strictEqual(engParsed.quantity, 3, 'Should extract quantity 3');
    assert.strictEqual(engParsed.unitPrice, 20, 'Should extract unit price 20');
    assert.strictEqual(engParsed.total, 60, 'Should calculate total = 60');
    assert.ok(engParsed.item.includes('Chips'), 'Item should contain Chips');
    console.log('✓ English voice parsed accurately:', JSON.stringify(engParsed));

    // Test 2: Hindi/Hinglish Voice Sentence Parsing
    console.log('\n[Test 2] Voice NLP: Parsing spoken Hindi/Hinglish sentence...');
    const hindiInput = 'Kharida pyaz 20 kilo 680 rupay';
    const hindiParsed = VoiceService.parseSentence(hindiInput);

    assert.strictEqual(hindiParsed.type, 'Purchase', 'Should detect type as Purchase for "kharida"');
    assert.strictEqual(hindiParsed.quantity, 20, 'Should extract 20 kilo');
    assert.strictEqual(hindiParsed.total, 680, 'Should extract total 680');
    assert.ok(hindiParsed.item.includes('Onions'), 'Commodity pyaz should be translated to Onions');
    console.log('✓ Hindi voice parsed accurately:', JSON.stringify(hindiParsed));

    // Test 3: Voice Save Controller - Confirmed Entry
    console.log('\n[Test 3] Voice Controller: Saving confirmed voice entry...');
    const reqSave = {
        user: { id: vendorId, role: 'vendor' },
        body: {
            item: hindiParsed.item,
            type: hindiParsed.type,
            amount: 680,
            quantity: 20,
            unitPrice: 34,
            audioPath: 'uploads/audio/demo_recording.webm'
        }
    };
    const resSave = createMockRes();
    voiceController.saveConfirmedVoice(reqSave, resSave, () => {});

    assert.strictEqual(resSave.statusCode, 201, 'Should return HTTP 201 Created');
    assert.ok(resSave.data && resSave.data.success, 'Save should be successful');
    assert.strictEqual(resSave.data.entry.source, 'voice', 'Source must be marked as voice');
    assert.strictEqual(resSave.data.entry.l, 4, 'Trust level must be 4 (Self-reported/Confirmed by you)');
    assert.strictEqual(resSave.data.entry.v, 'Confirmed by you', 'Label must be "Confirmed by you"');
    console.log('✓ Confirmed voice entry saved with audio link to DB:', resSave.data.entry.id);

    // Test 4: OCR Text Parsing for Supplier Mandi Bill
    console.log('\n[Test 4] OCR Service: Parsing supplier invoice text...');
    const billText = `
Chakarpur Mandi Wholesale Traders
Bill #418
Date: 20 Nov 2026
Tomatoes 100 kg @ 28 = 2800
Onions 80 kg @ 25 = 2000
Handling charges = 50
Total Amount: ₹4,850
Paid by: UPI / Cash
    `.trim();

    const ocrExtracted = OCRService.parseReceiptText(billText);
    assert.ok(ocrExtracted.supplierName.includes('Chakarpur Mandi'), 'Supplier name extracted');
    assert.strictEqual(ocrExtracted.billNumber, '418', 'Bill #418 extracted');
    assert.strictEqual(ocrExtracted.billDate, '2026-11-20', 'Bill date 2026-11-20 extracted');
    assert.strictEqual(ocrExtracted.amount, 4850, 'Total amount 4850 extracted');
    assert.ok(ocrExtracted.confidence >= 0.9, 'Confidence should be >= 90%');
    console.log('✓ Mandi bill parsed with high confidence:', JSON.stringify(ocrExtracted));

    // Test 5: OCR Scan Controller Endpoint
    console.log('\n[Test 5] OCR Controller: scanReceipt API invocation...');
    const reqOcr = {
        user: { id: vendorId, role: 'vendor' },
        body: { raw_text: billText },
        file: null
    };
    const resOcr = createMockRes();
    await ocrController.scanReceipt(reqOcr, resOcr, () => {});

    assert.strictEqual(resOcr.statusCode, 200, 'Should return HTTP 200');
    assert.strictEqual(resOcr.data.extracted.amount, 4850, 'Controller returns extracted total');
    assert.strictEqual(resOcr.data.extracted.billNumber, '418', 'Controller returns extracted bill number');
    console.log('✓ OCR Scan API working seamlessly with extracted financial fields.');

    console.log('\n======================================================');
    console.log('🎉 ALL STEP 6 TESTS PASSED SUCCESSFULLY! (5/5)');
    console.log('======================================================\n');
}

runStep6Tests().catch(err => {
    console.error('❌ Step 6 Test Failed:', err);
    process.exit(1);
});

const { randomUUID } = require('node:crypto');
const db = require('../config/db');
const VoiceService = require('../services/voiceService');

// 1. Transcribe & Parse Voice Input (English or Hindi)
exports.parseVoice = async (req, res, next) => {
    try {
        const transcript = req.body.transcript || (req.body.text ? req.body.text.trim() : null);
        const audioBuffer = req.file ? req.file.buffer : null;
        const filename = req.file ? req.file.originalname : 'voice.webm';

        const result = await VoiceService.processVoiceAudio(audioBuffer, filename, transcript);

        return res.json({
            success: true,
            draft: {
                say: result.say,
                type: result.type,
                item: result.item,
                rawItem: result.rawItemName,
                quantity: result.quantity,
                unitPrice: result.unitPrice,
                total: result.total,
                audioPath: result.audioPath
            }
        });
    } catch (err) {
        next(err);
    }
};

// 2. Save Confirmed Voice Entry
exports.saveConfirmedVoice = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const { item, type, amount, quantity, unitPrice, audioPath } = req.body;

        const absAmount = Math.abs(Number(amount));
        if (!item || !absAmount || isNaN(absAmount)) {
            return res.status(400).json({ success: false, error: 'Valid item and total amount are required.' });
        }

        const entryType = type === 'Purchase' ? 'Purchase' : 'Sale';
        const signedAmount = entryType === 'Sale' ? absAmount : -absAmount;
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];

        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const timeStr = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;

        const entryId = 'e_voice_' + randomUUID().slice(0, 8);
        const isoNow = now.toISOString();

        db.prepare(`
            INSERT INTO entries (
                id, vendor_id, entry_date, entry_time, item, type, amount,
                trust_level, verification_label, is_confirmed, source, voice_audio_path,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 4, 'Confirmed by you', 1, 'voice', ?, ?, ?)
        `).run(
            entryId,
            vendorId,
            dateStr,
            timeStr,
            item.trim(),
            entryType,
            signedAmount,
            audioPath || null,
            isoNow,
            isoNow
        );

        const newEntry = db.prepare(`SELECT * FROM entries WHERE id = ?`).get(entryId);

        return res.status(201).json({
            success: true,
            message: 'Voice entry saved successfully with attached audio proof.',
            entry: {
                id: newEntry.id,
                t: newEntry.entry_time,
                item: newEntry.item,
                ty: newEntry.type,
                a: newEntry.amount,
                v: newEntry.verification_label,
                l: newEntry.trust_level,
                source: newEntry.source,
                audioPath: newEntry.voice_audio_path
            }
        });
    } catch (err) {
        next(err);
    }
};

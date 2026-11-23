const { randomUUID } = require('node:crypto');
const db = require('../config/db');
const { MatchingEngine } = require('../services/matchingEngine');

// 1. Upload UPI Statement Transactions
exports.uploadStatement = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const transactions = req.body.transactions;

        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({ success: false, error: 'Array of transactions is required.' });
        }

        const insertTx = db.prepare(`
            INSERT INTO upi_transactions (
                id, vendor_id, reference_no, payer_payee, type, amount, tx_date, tx_time, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let addedCount = 0;
        const now = new Date().toISOString();

        for (const t of transactions) {
            const id = 'upi_' + randomUUID().slice(0, 10);
            const refNo = t.reference_no || `UPI${Date.now()}${Math.floor(Math.random() * 100)}`;
            const type = t.type === 'credit' ? 'credit' : 'debit';
            const amount = Math.abs(Number(t.amount));

            insertTx.run(
                id,
                vendorId,
                refNo,
                t.payer_payee || 'UPI Transfer',
                type,
                amount,
                t.tx_date || now.split('T')[0],
                t.tx_time || '12:00 PM',
                now
            );
            addedCount++;
        }

        // Run batch matching against any unverified receipts
        const matchSummary = MatchingEngine.matchAllUnmatched(vendorId);

        return res.status(201).json({
            success: true,
            message: `Imported ${addedCount} UPI transactions. ${matchSummary.newlyMatchedCount} receipts automatically upgraded to Payment-verified!`,
            addedCount,
            matchSummary
        });
    } catch (err) {
        next(err);
    }
};

// 2. Get all UPI transactions
exports.getTransactions = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const txs = db.prepare(`
            SELECT * FROM upi_transactions
            WHERE vendor_id = ?
            ORDER BY tx_date DESC, created_at DESC
        `).all(vendorId);

        return res.json({ success: true, count: txs.length, transactions: txs });
    } catch (err) {
        next(err);
    }
};

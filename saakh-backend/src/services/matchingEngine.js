const db = require('../config/db');

/**
 * Calculates absolute day difference between two YYYY-MM-DD date strings
 */
function getDayDifference(dateStr1, dateStr2) {
    const d1 = new Date(dateStr1 + 'T00:00:00Z');
    const d2 = new Date(dateStr2 + 'T00:00:00Z');
    const diffMs = Math.abs(d1.getTime() - d2.getTime());
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Receipt & UPI Reconciliation Engine
 * Automatically matches supplier bills with bank/UPI QR settlements within ±2 days tolerance
 * to award the prestigious "Payment-verified" badge (Trust Level 0).
 */
class MatchingEngine {
    /**
     * Match a single receipt against all unmatched UPI transactions for the vendor
     */
    static matchReceiptWithUPI(receipt, vendorId) {
        if (!receipt || !vendorId) return { matched: false };

        const receiptAmount = Math.abs(Number(receipt.amount));
        const receiptDate = receipt.bill_date;

        // Fetch all unmatched debit transactions for this vendor
        const candidateUpiTxs = db.prepare(`
            SELECT * FROM upi_transactions
            WHERE vendor_id = ?
              AND type = 'debit'
              AND (matched_receipt_id IS NULL OR matched_receipt_id = '')
        `).all(vendorId);

        let bestMatch = null;
        let lowestDayDiff = 999;

        for (const tx of candidateUpiTxs) {
            const txAmount = Math.abs(Number(tx.amount));
            const amountDiff = Math.abs(txAmount - receiptAmount);

            // 1. AMOUNT CHECK: Must be exact rupee match
            if (amountDiff > 1) continue;

            // 2. DATE CHECK: Must be within ±2 days (fintech rule from spec)
            const dayDiff = getDayDifference(tx.tx_date, receiptDate);
            if (dayDiff > 2) continue;

            // Pick the closest date match
            if (dayDiff < lowestDayDiff) {
                lowestDayDiff = dayDiff;
                bestMatch = tx;
            }
        }

        if (bestMatch) {
            // Found authentic reconciliation!
            // 1. Update receipt record
            db.prepare(`UPDATE receipts SET is_matched_upi = 1 WHERE id = ?`).run(receipt.id);

            // 2. Link UPI transaction
            db.prepare(`UPDATE upi_transactions SET matched_receipt_id = ? WHERE id = ?`).run(receipt.id, bestMatch.id);

            // 3. Upgrade any linked entry in entries ledger to Trust Level 0 (Payment-verified)
            db.prepare(`
                UPDATE entries
                SET trust_level = 0,
                    verification_label = 'Matched to UPI',
                    receipt_id = ?,
                    upi_tx_id = ?
                WHERE vendor_id = ?
                  AND (receipt_id = ? OR (type = 'Purchase' AND ABS(amount) = ? AND entry_date = ?))
            `).run(receipt.id, bestMatch.id, vendorId, receipt.id, receiptAmount, receiptDate);

            return {
                matched: true,
                dayDiff: lowestDayDiff,
                matchedUpiTx: {
                    id: bestMatch.id,
                    referenceNo: bestMatch.reference_no,
                    payerPayee: bestMatch.payer_payee,
                    amount: bestMatch.amount,
                    txDate: bestMatch.tx_date
                },
                trustLevel: 0,
                verificationLabel: 'Matched to UPI',
                badgeText: 'Payment-verified',
                message: `Receipt of ₹${receiptAmount} matched with UPI debit to ${bestMatch.payer_payee} (Ref: ${bestMatch.reference_no}, ${lowestDayDiff} day offset).`
            };
        }

        return {
            matched: false,
            trustLevel: 3,
            verificationLabel: 'Not yet confirmed',
            badgeText: 'Unverified photo',
            message: 'No matching UPI transaction found within ±2 days. Marked as Unverified photo.'
        };
    }

    /**
     * Reconcile all unmatched receipts against all unmatched UPI transactions
     */
    static matchAllUnmatched(vendorId) {
        const unmatchedReceipts = db.prepare(`
            SELECT * FROM receipts
            WHERE vendor_id = ? AND (is_matched_upi = 0 OR is_matched_upi IS NULL)
        `).all(vendorId);

        const results = [];
        for (const receipt of unmatchedReceipts) {
            const matchRes = this.matchReceiptWithUPI(receipt, vendorId);
            if (matchRes.matched) {
                results.push({
                    receiptId: receipt.id,
                    supplier: receipt.supplier_name,
                    amount: receipt.amount,
                    matchDetails: matchRes
                });
            }
        }

        return {
            totalScanned: unmatchedReceipts.length,
            newlyMatchedCount: results.length,
            matches: results
        };
    }
}

module.exports = {
    MatchingEngine,
    getDayDifference
};

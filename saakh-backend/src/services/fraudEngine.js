const { randomUUID } = require('node:crypto');
const db = require('../config/db');

// Benchmark market rates per unit (kg/pack) for agricultural & grocery staples
const MARKET_BENCHMARKS = {
    'sugar': { rate: 44, unit: 'kg', maxAllowed: 55 },
    'tomatoes': { rate: 30, unit: 'kg', maxAllowed: 45 },
    'potatoes': { rate: 25, unit: 'kg', maxAllowed: 35 },
    'onions': { rate: 35, unit: 'kg', maxAllowed: 50 },
    'oil': { rate: 130, unit: 'litre', maxAllowed: 165 },
    'rice': { rate: 45, unit: 'kg', maxAllowed: 65 }
};

/**
 * Fraud & Anomaly Detection Engine for Saakh
 * Detects duplicate receipt uploads, round-amount invoice fabrications,
 * price-gouging rate mismatches, and bot burst voice entries.
 */
class FraudEngine {
    /**
     * 1. Check for Duplicate Receipt Images
     * Detects if the same image hash appears across multiple receipts or across different vendors
     */
    static checkDuplicateReceipts(vendorId) {
        const receipts = db.prepare(`SELECT * FROM receipts WHERE vendor_id = ?`).all(vendorId);
        const flags = [];

        for (const r of receipts) {
            if (!r.image_hash) continue;

            // Search for collision in receipts table
            const duplicate = db.prepare(`
                SELECT r.*, v.name as other_vendor_name
                FROM receipts r
                JOIN vendors v ON r.vendor_id = v.id
                WHERE r.image_hash = ? AND r.id != ?
            `).get(r.image_hash, r.id);

            if (duplicate) {
                flags.push({
                    type: 'duplicate_receipt',
                    severity: 'critical',
                    receiptId: r.id,
                    description: `Duplicate receipt image found. Identical bill uploaded under ${duplicate.other_vendor_name} on ${duplicate.bill_date}.`,
                    evidence: {
                        thisReceipt: { id: r.id, supplier: r.supplier_name, date: r.bill_date },
                        duplicateReceipt: { id: duplicate.id, vendor: duplicate.other_vendor_name, date: duplicate.bill_date }
                    }
                });
            }
        }

        return {
            passed: flags.length === 0,
            flagCount: flags.length,
            flags
        };
    }

    /**
     * 2. Check for Round Amount Invoices
     * Authentic wholesale receipts have odd rupees/paise (e.g. ₹4,850, ₹3,420).
     * Fake fabricated bills are overwhelmingly round numbers (₹10,000, ₹15,000).
     */
    static checkRoundAmounts(vendorId) {
        const receipts = db.prepare(`SELECT * FROM receipts WHERE vendor_id = ?`).all(vendorId);
        if (receipts.length === 0) return { passed: true, flags: [] };

        const roundReceipts = receipts.filter(r => {
            const amt = Math.abs(Number(r.amount));
            return amt >= 5000 && (amt % 1000 === 0 || amt % 5000 === 0);
        });

        const roundPercentage = Math.round((roundReceipts.length / receipts.length) * 100);
        const flags = [];

        if (roundReceipts.length >= 2 && roundPercentage >= 70) {
            flags.push({
                type: 'round_amount',
                severity: 'high',
                description: `All ${roundReceipts.length} receipts are round amounts (e.g. ₹10,000, ₹15,000). Highly characteristic of manual fabrication.`,
                evidence: {
                    totalReceipts: receipts.length,
                    roundCount: roundReceipts.length,
                    percentage: roundPercentage,
                    samples: roundReceipts.slice(0, 3).map(r => `Receipt total ₹${r.amount}, round amount`)
                }
            });
        }

        return {
            passed: flags.length === 0,
            roundPercentage,
            flags
        };
    }

    /**
     * 3. Check Rates vs Market Benchmark
     * Flags entries where price per kg is wildly above mandi wholesale rates
     * (e.g. Sugar 50 kg @ ₹78/kg vs market benchmark ₹44/kg)
     */
    static checkRateVsMarket(vendorId) {
        // Rate check applies to wholesale purchases / supplier claims
        const entries = db.prepare(`SELECT * FROM entries WHERE vendor_id = ? AND type = 'Purchase'`).all(vendorId);
        const flags = [];

        for (const e of entries) {
            const itemLower = (e.item || '').toLowerCase();

            for (const [commodity, benchmark] of Object.entries(MARKET_BENCHMARKS)) {
                if (itemLower.includes(commodity)) {
                    // Extract quantity and rate if formatted e.g. "Sugar 50 kg" and amount 3900 -> 3900/50 = 78
                    const kgMatch = itemLower.match(/(\d+)\s*(kg|kilo)/);
                    if (kgMatch) {
                        const qty = Number(kgMatch[1]);
                        const totalAmt = Math.abs(Number(e.amount));
                        const unitRate = qty > 0 ? Math.round(totalAmt / qty) : totalAmt;

                        if (unitRate > benchmark.maxAllowed) {
                            flags.push({
                                type: 'rate_mismatch',
                                severity: 'high',
                                description: `${e.item}: ₹${unitRate} per ${benchmark.unit} vs market ₹${benchmark.rate} per ${benchmark.unit} (${Math.round(((unitRate - benchmark.rate) / benchmark.rate) * 100)}% above benchmark).`,
                                evidence: { item: e.item, billedRate: unitRate, benchmarkRate: benchmark.rate }
                            });
                        }
                    }
                }
            }
        }

        return {
            passed: flags.length === 0,
            flags
        };
    }

    /**
     * 4. Check Burst Voice / Automated Bot Entries
     * Flags velocity anomalies like 42 voice entries recorded within 3 minutes (180 seconds)
     */
    static checkBurstVoiceEntries(vendorId) {
        const voiceEntries = db.prepare(`
            SELECT id, entry_date, created_at
            FROM entries
            WHERE vendor_id = ? AND source = 'voice'
            ORDER BY created_at ASC
        `).all(vendorId);

        const flags = [];
        if (voiceEntries.length >= 10) {
            // Check rolling 180-second window
            for (let i = 0; i < voiceEntries.length - 9; i++) {
                const tStart = new Date(voiceEntries[i].created_at).getTime();
                let clusterCount = 1;

                for (let j = i + 1; j < voiceEntries.length; j++) {
                    const tCurr = new Date(voiceEntries[j].created_at).getTime();
                    if ((tCurr - tStart) <= 180 * 1000) { // 3 minutes
                        clusterCount++;
                    } else {
                        break;
                    }
                }

                if (clusterCount >= 10) {
                    flags.push({
                        type: 'burst_voice_entries',
                        severity: 'critical',
                        description: `${clusterCount} voice entries recorded within 3 minutes. Automated script or bot fabrication detected.`,
                        evidence: { burstCount: clusterCount, timeWindowSeconds: 180 }
                    });
                    break;
                }
            }
        }

        return {
            passed: flags.length === 0,
            flags
        };
    }

    /**
     * Full Comprehensive Fraud Scan on a Vendor
     * Saves flags into the SQLite `flags` table and computes risk assessment
     */
    static scanVendor(vendorId) {
        const duplicateCheck = this.checkDuplicateReceipts(vendorId);
        const roundAmountCheck = this.checkRoundAmounts(vendorId);
        const rateCheck = this.checkRateVsMarket(vendorId);
        const burstCheck = this.checkBurstVoiceEntries(vendorId);

        const allFlags = [
            ...duplicateCheck.flags,
            ...roundAmountCheck.flags,
            ...rateCheck.flags,
            ...burstCheck.flags
        ];

        // Persist flags into the flags database table
        db.prepare(`DELETE FROM flags WHERE vendor_id = ?`).run(vendorId);

        const insertFlag = db.prepare(`
            INSERT INTO flags (id, vendor_id, flag_type, severity, description, evidence_data, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const now = new Date().toISOString();
        for (const f of allFlags) {
            insertFlag.run(
                'flg_' + randomUUID().slice(0, 8),
                vendorId,
                f.type,
                f.severity,
                f.description,
                JSON.stringify(f.evidence || {}),
                now
            );
        }

        // Calculate risk score: 0 (clean) to 100 (high fraud risk)
        let riskScore = 0;
        allFlags.forEach(f => {
            if (f.severity === 'critical') riskScore += 35;
            else if (f.severity === 'high') riskScore += 25;
            else if (f.severity === 'medium') riskScore += 15;
            else riskScore += 5;
        });
        riskScore = Math.min(riskScore, 100);

        const isHighRisk = riskScore >= 50 || allFlags.length >= 2;

        return {
            vendorId,
            riskScore,
            riskLevel: isHighRisk ? 'High' : (riskScore > 20 ? 'Medium' : 'Low'),
            totalFlags: allFlags.length,
            isFlagged: isHighRisk,
            riskChecksSummary: [
                { check: 'Duplicate receipt images', passed: duplicateCheck.passed },
                { check: 'All receipts are round amounts', passed: roundAmountCheck.passed },
                { check: 'Rates far above market', passed: rateCheck.passed },
                { check: 'Burst voice entries (3 mins)', passed: burstCheck.passed }
            ],
            flags: allFlags,
            recommendation: isHighRisk
                ? 'Request field verification before any further review. 3 receipts flagged.'
                : 'No fraud indicators detected. Profile verified for underwriting.'
        };
    }
}

module.exports = FraudEngine;

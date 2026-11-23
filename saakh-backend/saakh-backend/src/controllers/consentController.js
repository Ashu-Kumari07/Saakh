const { randomUUID } = require('node:crypto');
const db = require('../config/db');

// Helper to format Indian date string
function formatDisplayDate(date = new Date()) {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// 1. Get current consent and sharing status for the vendor
exports.getConsentStatus = (req, res, next) => {
    try {
        const vendorId = req.user.id;

        // Fetch all consents with lender details
        const consents = db.prepare(`
            SELECT c.id, c.vendor_id, c.lender_id, c.status, c.scope, c.valid_until, c.updated_at,
                   l.name as lender_name, l.organization as lender_org, l.email as lender_email
            FROM consents c
            JOIN lenders l ON c.lender_id = l.id
            WHERE c.vendor_id = ?
        `).all(vendorId);

        // Find primary Kanpur Microfinance consent (for demo/screens)
        const primaryConsent = consents.find(c => c.lender_org.includes('Kanpur') || c.lender_id === 'l_priya_01') || consents[0];

        const isSharingActive = primaryConsent ? (primaryConsent.status === 'active' && new Date(primaryConsent.valid_until) >= new Date()) : false;

        return res.json({
            success: true,
            isSharingActive,
            primaryConsent: primaryConsent ? {
                id: primaryConsent.id,
                lenderId: primaryConsent.lender_id,
                lenderName: primaryConsent.lender_name,
                organization: primaryConsent.lender_org,
                status: primaryConsent.status,
                scope: JSON.parse(primaryConsent.scope || '[]'),
                validUntil: primaryConsent.valid_until,
                displayValidUntil: formatDisplayDate(primaryConsent.valid_until)
            } : null,
            allConsents: consents.map(c => ({
                id: c.id,
                lenderId: c.lender_id,
                lenderName: c.lender_name,
                organization: c.lender_org,
                status: c.status,
                validUntil: c.valid_until
            }))
        });
    } catch (err) {
        next(err);
    }
};

// 2. Grant or re-enable consent
exports.grantConsent = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const { lender_id, duration_months, scope } = req.body;

        // Default to Kanpur Microfinance (Priya Sharma)
        const targetLenderId = lender_id || 'l_priya_01';
        const lender = db.prepare(`SELECT * FROM lenders WHERE id = ?`).get(targetLenderId);
        if (!lender) {
            return res.status(404).json({ success: false, error: 'Lender organization not found.' });
        }

        const months = Number(duration_months) || 3;
        const validUntilDate = new Date();
        validUntilDate.setMonth(validUntilDate.getMonth() + months);
        const validUntil = validUntilDate.toISOString().split('T')[0];

        const consentScope = JSON.stringify(scope || ['income_range', 'evidence_summary', 'fraud_checks']);
        const now = new Date().toISOString();
        const consentId = 'c_' + randomUUID().slice(0, 8);

        // Server-side upsert into consents table
        db.prepare(`
            INSERT INTO consents (id, vendor_id, lender_id, status, scope, valid_until, created_at, updated_at)
            VALUES (?, ?, ?, 'active', ?, ?, ?, ?)
            ON CONFLICT(vendor_id, lender_id) DO UPDATE SET
                status = 'active',
                scope = excluded.scope,
                valid_until = excluded.valid_until,
                updated_at = excluded.updated_at
        `).run(consentId, vendorId, targetLenderId, consentScope, validUntil, now, now);

        // Write to access_log that consent was granted / received
        const logId = 'al_' + randomUUID().slice(0, 8);
        const displayTimestamp = new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });

        db.prepare(`
            INSERT INTO access_log (id, vendor_id, lender_id, lender_name, lender_org, action, timestamp, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            logId,
            vendorId,
            targetLenderId,
            lender.name,
            lender.organization,
            'received your profile',
            displayTimestamp,
            req.ip || '127.0.0.1',
            (req.headers && req.headers['user-agent']) || 'Web Client'
        );

        return res.json({
            success: true,
            message: `Consent granted to ${lender.organization} until ${validUntil}.`,
            consent: {
                lenderId: targetLenderId,
                organization: lender.organization,
                status: 'active',
                validUntil,
                displayValidUntil: formatDisplayDate(validUntil)
            }
        });
    } catch (err) {
        next(err);
    }
};

// 3. Revoke consent (Immediate server-side access cut-off)
exports.revokeConsent = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const { lender_id } = req.body;
        const targetLenderId = lender_id || 'l_priya_01';

        const result = db.prepare(`
            UPDATE consents
            SET status = 'revoked', updated_at = ?
            WHERE vendor_id = ? AND lender_id = ?
        `).run(new Date().toISOString(), vendorId, targetLenderId);

        if (result.changes === 0) {
            // Also insert a revoked record if no record existed
            const consentId = 'c_' + randomUUID().slice(0, 8);
            const now = new Date().toISOString();
            db.prepare(`
                INSERT INTO consents (id, vendor_id, lender_id, status, scope, valid_until, created_at, updated_at)
                VALUES (?, ?, ?, 'revoked', '[]', ?, ?, ?)
            `).run(consentId, vendorId, targetLenderId, now.split('T')[0], now, now);
        }

        const lender = db.prepare(`SELECT organization FROM lenders WHERE id = ?`).get(targetLenderId);
        const orgName = lender ? lender.organization : 'Lender';

        return res.json({
            success: true,
            message: `Sharing with ${orgName} has been stopped immediately. They can no longer access your data.`,
            status: 'revoked'
        });
    } catch (err) {
        next(err);
    }
};

// 4. Get Access Log (Who viewed your profile)
exports.getAccessLog = (req, res, next) => {
    try {
        const vendorId = req.user.id;

        const logs = db.prepare(`
            SELECT id, lender_name, lender_org, action, timestamp, ip_address
            FROM access_log
            WHERE vendor_id = ?
            ORDER BY id DESC
            LIMIT 50
        `).all(vendorId);

        // Format into human-readable strings matching frontend (S.views)
        const formattedViews = logs.map(l =>
            `${l.lender_name}, ${l.lender_org} ${l.action}, ${l.timestamp}`
        );

        return res.json({
            success: true,
            count: logs.length,
            views: formattedViews,
            rawLogs: logs
        });
    } catch (err) {
        next(err);
    }
};

// 5. Get incoming consent requests
exports.getPendingRequests = (req, res, next) => {
    try {
        const vendorId = req.user.id;

        // Return the active pending request matching the UI design
        const pending = [
            {
                id: 'req_kanpur_01',
                lenderId: 'l_priya_01',
                organization: 'Kanpur Microfinance',
                isVerifiedLender: true,
                verificationDate: '4 Oct 2026',
                requestedBy: 'Priya Sharma, Loan Officer',
                requestDate: '23 Nov 2026',
                reason: 'You applied for a business loan through their agent on 18 Nov 2026',
                sharedItems: [
                    'Estimated income range',
                    'Confidence level',
                    'How your entries are verified',
                    'Fraud checks'
                ],
                protectedItems: [
                    'Voice recordings',
                    'Raw UPI statement',
                    'Receipt photos',
                    'Phone number'
                ],
                durationOptions: [
                    { label: '1 month (until 23 Dec 2026)', value: 1 },
                    { label: '3 months (until 23 Feb 2027)', value: 3, default: true },
                    { label: '6 months (until 23 May 2027)', value: 6 }
                ]
            }
        ];

        return res.json({ success: true, requests: pending });
    } catch (err) {
        next(err);
    }
};

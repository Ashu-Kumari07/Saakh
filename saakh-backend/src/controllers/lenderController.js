const { randomUUID } = require('node:crypto');
const db = require('../config/db');

// Helper to log server-side access to access_log
function recordAccess(vendorId, lender, action, req) {
    try {
        const logId = 'al_' + randomUUID().slice(0, 8);
        const timestamp = new Date().toLocaleDateString('en-IN', {
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
            lender.id,
            lender.name,
            lender.organization,
            action,
            timestamp,
            req.ip || '127.0.0.1',
            req.headers['user-agent'] || 'Lender Web'
        );
    } catch (err) {
        console.error('[Access Log Error]:', err);
    }
}

// 1. Get lender applications queue
// "Lender sirf unhi vendors ko dekh sake jinhone consent diya hai... Lender ko kaccha data nahi, sirf summary mile."
exports.getApplications = (req, res, next) => {
    try {
        const lenderId = req.user.id;
        const vendors = db.prepare(`SELECT * FROM vendors ORDER BY id ASC`).all();

        const applications = vendors.map(v => {
            // Check server-side consent for this vendor with the logged-in lender
            const consent = db.prepare(`
                SELECT * FROM consents WHERE vendor_id = ? AND lender_id = ?
            `).get(v.id, lenderId);

            const isConsentValid = consent && consent.status === 'active' && new Date(consent.valid_until) >= new Date();
            const isConsentWithdrawn = consent && consent.status === 'revoked';
            const isFlagged = v.id === 'v_vikas_02';

            // Base record structure matching frontend Applications table
            if (!isConsentValid) {
                return {
                    id: v.id,
                    name: v.name,
                    businessSubtitle: `${v.business_type} · ${v.city}`,
                    incomeRange: 'Hidden until the vendor gives consent',
                    confidence: 'Awaiting consent',
                    evidenceMix: null,
                    consentStatus: isConsentWithdrawn ? 'withdrawn' : 'pending',
                    consentBadge: isConsentWithdrawn ? 'Consent withdrawn' : 'Consent pending',
                    suggestedMaxEmi: '—',
                    canReview: false,
                    reviewRoute: null
                };
            }

            if (isFlagged) {
                return {
                    id: v.id,
                    name: v.name,
                    businessSubtitle: `${v.business_type} · ${v.city}`,
                    incomeRange: 'Cannot be estimated reliably',
                    confidence: 'Low',
                    evidenceMix: [8, 0, 0, 52, 40],
                    consentStatus: 'valid',
                    consentBadge: 'Consent valid',
                    suggestedMaxEmi: '—',
                    isFlagged: true,
                    flagReason: 'Flagged: receipt mismatch',
                    canReview: true,
                    reviewRoute: 'vikas'
                };
            }

            // Normal verified applicant (e.g. Ramesh Kumar, Sita Verma)
            const incomeData = v.id === 'v_sita_03' ? {
                range: '₹38,000 to ₹46,000',
                conf: 'High',
                mix: [52, 34, 8, 0, 6],
                emi: '₹11,000',
                route: null
            } : {
                range: '₹27,000 to ₹35,000',
                conf: 'High',
                mix: [68, 14, 8, 5, 5],
                emi: '₹8,000',
                route: 'ramesh'
            };

            return {
                id: v.id,
                name: v.name,
                businessSubtitle: `${v.business_type} · ${v.city}`,
                incomeRange: incomeData.range,
                confidence: incomeData.conf,
                evidenceMix: incomeData.mix,
                consentStatus: 'valid',
                consentBadge: 'Consent valid',
                suggestedMaxEmi: incomeData.emi,
                isFlagged: false,
                canReview: true,
                reviewRoute: incomeData.route
            };
        });

        return res.json({
            success: true,
            stats: {
                newThisWeek: 24,
                averageConfidence: 'Medium-High',
                purchasesPaymentVerified: '58%',
                flaggedCount: 2
            },
            applications
        });
    } catch (err) {
        next(err);
    }
};

// 2. Get Vendor Review Details (Ramesh Kumar / Vikas S.)
// CRITICAL SERVER-SIDE CONSENT CHECK:
// "Har request par server check kare aur har view access_log mein likhe. Lender ko kaccha data nahi, sirf summary mile."
exports.getVendorReview = (req, res, next) => {
    try {
        const lender = req.user;
        const vendorId = req.params.vendorId;

        const vendor = db.prepare(`SELECT * FROM vendors WHERE id = ?`).get(vendorId);
        if (!vendor) {
            return res.status(404).json({ success: false, error: 'Vendor application not found.' });
        }

        // 1. STRICT SERVER-SIDE CONSENT VERIFICATION
        const consent = db.prepare(`
            SELECT * FROM consents
            WHERE vendor_id = ? AND lender_id = ?
        `).get(vendorId, lender.id);

        const hasActiveConsent = consent && consent.status === 'active' && new Date(consent.valid_until) >= new Date();

        if (!hasActiveConsent) {
            return res.status(403).json({
                success: false,
                code: 'CONSENT_DENIED',
                error: 'No consent. This vendor has stopped sharing their profile, so you can no longer view it. Access ended immediately.'
            });
        }

        // 2. RECORD AUDIT ACCESS IN access_log
        recordAccess(vendorId, lender, 'viewed your income summary', req);

        // 3. CURATED SUMMARY ONLY (No raw phone numbers, no audio files, no raw statements)
        if (vendorId === 'v_vikas_02') {
            return res.json({
                success: true,
                vendor: {
                    id: vendor.id,
                    name: vendor.name,
                    business: 'Kirana shop',
                    city: 'Indore',
                    yearsInBusiness: 1,
                    consentValidUntil: consent.valid_until
                },
                underwriting: {
                    estimatedIncome: 'Cannot be estimated reliably',
                    confidence: 'Low',
                    claimedIncome: '₹60,000 per month',
                    supportedIncome: 'Purchases support only ₹25,000 per month (claim is 2.4x higher)',
                    suggestedAction: 'Request field verification before any further review',
                    evidenceMix: [8, 0, 0, 52, 40],
                    riskChecks: [
                        { label: 'Duplicate receipt images found', passed: false },
                        { label: 'All 12 receipts are round amounts', passed: false },
                        { label: 'Rates far above market', passed: false },
                        { label: '42 voice entries recorded within 3 minutes', passed: false }
                    ],
                    flaggedEvidence: [
                        { item: 'Sugar 50 kg: ₹78 per kg vs market ₹44 per kg', flag: 'Rate mismatch' },
                        { item: 'Receipt total ₹10,000, round amount', flag: 'Round amount' },
                        { item: 'Receipt total ₹15,000, round amount', flag: 'Round amount' }
                    ],
                    incomeCrossCheck: {
                        agreed: false,
                        message: 'Sources do not agree',
                        ranges: [
                            { source: 'Supplier purchases', min: 22000, max: 28000, type: 'invoice' },
                            { source: 'Daily voice log', min: 55000, max: 65000, type: 'self' },
                            { source: 'UPI inflow', min: 18000, max: 26000, type: 'invoice' }
                        ]
                    }
                }
            });
        }

        // Ramesh Kumar (Verified Vendor)
        return res.json({
            success: true,
            vendor: {
                id: vendor.id,
                name: vendor.name,
                business: 'Vegetable vendor',
                city: 'Kanpur',
                yearsInBusiness: 4,
                consentValidUntil: consent.valid_until
            },
            underwriting: {
                estimatedIncomeRange: '₹27,000 to ₹35,000',
                confidence: 'High',
                suggestedMaxEmi: '₹8,000',
                evidenceMix: [65, 15, 10, 6, 4],
                riskChecks: [
                    { label: 'No duplicate receipts', passed: true },
                    { label: 'Claims match purchase pattern', passed: true },
                    { label: 'Rates within market range', passed: true }
                ],
                incomeCrossCheck: {
                    agreed: true,
                    message: 'All three sources agree',
                    overlap: [28000, 34500],
                    ranges: [
                        { source: 'Supplier purchases', min: 27000, max: 36000, type: 'invoice' },
                        { source: 'Daily voice log', min: 28000, max: 37500, type: 'self' },
                        { source: 'UPI inflow', min: 26000, max: 34500, type: 'payment' }
                    ]
                },
                scoreBreakdown: [
                    { category: 'UPI', weight: 30, type: 'payment' },
                    { category: 'Purchases', weight: 30, type: 'payment' },
                    { category: 'Utility', weight: 15, type: 'invoice' },
                    { category: 'Business history', weight: 10, type: 'invoice' },
                    { category: 'SHG', weight: 10, type: 'supplier' },
                    { category: 'Voice log', weight: 5, type: 'self' }
                ],
                evidenceTabs: {
                    'Receipts': [
                        { title: 'Chakarpur Mandi: Tomatoes & onions (180 kg)', amount: '₹4,850', date: '20 Nov 2026', trustLevel: 0 },
                        { title: 'Maheshwari Sabzi Traders: Potatoes & cauliflower', amount: '₹3,420', date: '17 Nov 2026', trustLevel: 1 },
                        { title: 'Green Leaf Wholesale: Coriander & chillies', amount: '₹1,960', date: '15 Nov 2026', trustLevel: 2 },
                        { title: 'Handwritten stall slip: Seasonal peas & okra', amount: '₹2,150', date: '12 Nov 2026', trustLevel: 3 },
                        { title: 'Chakarpur Mandi: Mixed root vegetables (210 kg)', amount: '₹5,240', date: '09 Nov 2026', trustLevel: 0 }
                    ],
                    'UPI matches': [
                        { title: 'PhonePe settlement: 14 customer QR payments', amount: '₹1,840', date: '21 Nov 2026', trustLevel: 0 },
                        { title: 'UPI transfer to Chakarpur Mandi (bill #418)', amount: '₹4,850', date: '20 Nov 2026', trustLevel: 0 },
                        { title: 'Paytm QR inflow: 19 customer payments', amount: '₹2,120', date: '19 Nov 2026', trustLevel: 0 }
                    ],
                    'Voice log': [
                        { title: 'Evening stall closing, Hindi voice entry', amount: '₹1,420', date: '21 Nov 2026', trustLevel: 4 },
                        { title: 'Morning cart sales, Hindi voice entry', amount: '₹1,180', date: '20 Nov 2026', trustLevel: 4 },
                        { title: 'Full day cash tally, Hindi voice entry', amount: '₹1,350', date: '19 Nov 2026', trustLevel: 4 }
                    ],
                    'Utility bills': [
                        { title: 'Kanpur Electricity Supply Co.', amount: '₹940', date: '05 Nov 2026', trustLevel: 0 },
                        { title: 'Jio prepaid business pack, 84 days', amount: '₹719', date: '18 Oct 2026', trustLevel: 0 }
                    ],
                    'SHG': [
                        { title: 'Kalyanpur Vyapar Bachat Samuh: monthly saving', amount: '₹1,500', date: '02 Nov 2026', trustLevel: 2 },
                        { title: 'Kalyanpur Vyapar Bachat Samuh: internal loan repaid', amount: '₹12,000', date: '01 Oct 2026', trustLevel: 1 }
                    ]
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

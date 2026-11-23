const FraudEngine = require('../services/fraudEngine');
const db = require('../config/db');

// 1. Run live fraud scan on vendor
exports.scanVendor = (req, res, next) => {
    try {
        const vendorId = req.params.vendorId || req.user.id;
        const result = FraudEngine.scanVendor(vendorId);

        return res.json({
            success: true,
            scanResult: result
        });
    } catch (err) {
        next(err);
    }
};

// 2. Get existing flags from flags database table
exports.getVendorFlags = (req, res, next) => {
    try {
        const vendorId = req.params.vendorId || req.user.id;
        const flags = db.prepare(`
            SELECT * FROM flags
            WHERE vendor_id = ?
            ORDER BY created_at DESC
        `).all(vendorId);

        return res.json({
            success: true,
            count: flags.length,
            flags: flags.map(f => ({
                id: f.id,
                type: f.flag_type,
                severity: f.severity,
                description: f.description,
                evidence: JSON.parse(f.evidence_data || '{}'),
                createdAt: f.created_at
            }))
        });
    } catch (err) {
        next(err);
    }
};

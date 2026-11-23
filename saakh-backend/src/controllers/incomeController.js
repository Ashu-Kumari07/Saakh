const IncomeEngine = require('../services/incomeEngine');

// 1. Get real-time calculated score for authenticated vendor (Powers #score page)
exports.getVendorScore = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const profile = IncomeEngine.calculateVendorUnderwriting(vendorId);

        if (!profile) {
            return res.status(404).json({ success: false, error: 'Vendor profile not found.' });
        }

        return res.json({
            success: true,
            scoreData: {
                incomeRange: profile.estimatedMonthlyIncomeRange,
                minIncome: profile.minIncome,
                maxIncome: profile.maxIncome,
                confidence: profile.confidence,
                suggestedMaxEmi: profile.suggestedMaxEmi,
                evidenceMix: profile.evidenceMix,
                whyThisScore: profile.whyThisScore,
                howToImprove: profile.howToImprove,
                incomeCrossCheck: profile.incomeCrossCheck,
                scoreBreakdown: profile.scoreBreakdown,
                speechSummary: `Your estimated income is ${profile.minIncome / 1000} thousand to ${profile.maxIncome / 1000} thousand rupees a month. You log sales almost every day and pay your supplier on time.`
            }
        });
    } catch (err) {
        next(err);
    }
};

// 2. Direct Underwriting calculation by vendorId
exports.getUnderwriting = (req, res, next) => {
    try {
        const vendorId = req.params.vendorId;
        const profile = IncomeEngine.calculateVendorUnderwriting(vendorId);

        if (!profile) {
            return res.status(404).json({ success: false, error: 'Vendor not found.' });
        }

        return res.json({ success: true, underwriting: profile });
    } catch (err) {
        next(err);
    }
};

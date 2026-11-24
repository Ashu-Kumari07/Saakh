const IncomeEngine = require('../services/incomeEngine');

// 1. Get real-time calculated score for authenticated vendor (Powers #score page)
exports.getVendorScore = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const lang = req.lang || 'en';
        const profile = IncomeEngine.calculateVendorUnderwriting(vendorId, lang);

        if (!profile) {
            return res.status(404).json({ success: false, error: req.t ? req.t('not_found', req.method, req.originalUrl) : 'Vendor profile not found.' });
        }

        const isHi = lang === 'hi';
        const speechSummary = (vendorId === 'v_ramesh_01')
            ? (isHi ? 'आपकी अनुमानित आय 27 हज़ार से 35 हज़ार रुपये प्रति माह है। आप लगभग हर दिन बिक्री दर्ज करते हैं और अपने आपूर्तिकर्ता को समय पर भुगतान करते हैं।'
                    : 'Your estimated income is 27 thousand to 35 thousand rupees a month. You log sales almost every day and pay your supplier on time.')
            : (isHi ? `आपकी अनुमानित मासिक आय ${profile.minIncome / 1000} हज़ार से ${profile.maxIncome / 1000} हज़ार रुपये है।`
                    : `Your estimated monthly income is ${profile.minIncome / 1000} thousand to ${profile.maxIncome / 1000} thousand rupees.`);

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
                speechSummary
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
        const lang = req.lang || 'en';
        const profile = IncomeEngine.calculateVendorUnderwriting(vendorId, lang);

        if (!profile) {
            return res.status(404).json({ success: false, error: req.t ? req.t('not_found', req.method, req.originalUrl) : 'Vendor not found.' });
        }

        return res.json({ success: true, underwriting: profile });
    } catch (err) {
        next(err);
    }
};

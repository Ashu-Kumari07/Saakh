/**
 * Centralized Bilingual (English & Hindi) Internationalization System for Saakh Backend
 * Detects language via 'Accept-Language', 'X-Language' header, or 'lang' query parameter.
 */

const DICTIONARY = {
    en: {
        // Auth & Tokens
        auth_required: 'Authentication required. Missing or invalid Bearer token.',
        auth_invalid_token: 'Invalid or expired token. Please sign in again.',
        auth_role_denied: "Access denied. Role '%s' is not authorized.",
        phone_required: 'Mobile number is required.',
        otp_sent: 'OTP sent successfully to +91 %s',
        otp_required: 'Phone number and OTP code are required.',
        otp_invalid: 'Invalid or incorrect OTP. Please try again.',
        otp_expired: 'OTP has expired. Please request a new OTP.',
        otp_incorrect: 'Incorrect OTP. %s attempts remaining.',
        otp_cooldown_error: 'Please wait %s seconds before requesting another OTP.',
        otp_rate_limit_exceeded: 'Too many OTP requests for this number. Please try again after 1 hour.',
        otp_max_attempts_exceeded: 'Too many failed attempts. This OTP session has been locked. Please request a new OTP.',
        sms_gateway_not_configured: 'SMS gateway is not configured in .env. Please configure TWOFACTOR_API_KEY or MSG91_AUTH_KEY to deliver real SMS.',
        sms_delivery_failed: 'SMS delivery failed: %s',
        lender_credentials_required: 'Email and password are required.',
        lender_invalid: 'Invalid email or password.',
        lender_login_success: 'Lender authenticated successfully',

        // Entries & Ledger
        entry_item_amount_required: 'Valid item and amount are required.',
        entry_created: 'Entry created successfully.',
        entry_not_found: 'Entry not found.',
        entry_updated: 'Entry updated successfully. Trust level adjusted to self-reported.',
        entry_deleted: 'Entry deleted successfully.',
        self_reported_label: 'Edited by you',
        confirmed_label: 'Confirmed by you',
        payment_verified_label: 'Matched to UPI',

        // Consent & Privacy
        consent_denied: 'Access denied. Vendor has not granted or has revoked consent.',
        consent_granted: 'Consent granted successfully to %s',
        consent_revoked: 'Consent revoked successfully for %s',
        lender_view_logged: 'Lender viewed applicant profile',

        // Receipts & Reconciliation
        receipt_required: 'Valid receipt image or bill text is required.',
        receipt_uploaded: 'Receipt uploaded successfully. Trust level assigned: %s',
        upi_reconciled: 'Reconciliation complete. %s receipts upgraded to Payment-verified.',

        // Fraud Checks
        fraud_scan_complete: 'Fraud and anomaly scan completed.',

        // Voice & OCR
        voice_parsed: 'Voice transcript parsed successfully.',
        voice_saved: 'Voice entry saved successfully with attached audio proof.',
        ocr_scanned: 'Receipt scanned and text extracted successfully.',

        // Income Speech & Summaries
        speech_ramesh: 'Your estimated income is 27 thousand to 35 thousand rupees a month. You log sales almost every day and pay your supplier on time.',
        speech_vikas: 'Income cannot be estimated reliably. 3 receipts flagged for review.',
        speech_default: 'Your estimated monthly income is %s to %s rupees.',
        sources_agree: 'All three sources agree',
        sources_disagree: 'Sources do not agree',

        // Generic
        internal_error: 'Internal server error occurred.',
        not_found: "Endpoint '%s %s' not found."
    },
    hi: {
        // Auth & Tokens
        auth_required: 'प्रमाणीकरण आवश्यक है। अनुपलब्ध या अमान्य टोकन।',
        auth_invalid_token: 'अमान्य या समाप्त टोकन। कृपया पुनः साइन इन करें।',
        auth_role_denied: "पहुँच अस्वीकृत। '%s' अधिकृत भूमिका नहीं है।",
        phone_required: 'मोबाइल नंबर आवश्यक है।',
        otp_sent: '+91 %s पर OTP सफलतापूर्वक भेजा गया',
        otp_required: 'फ़ोन नंबर और OTP कोड दोनों आवश्यक हैं।',
        otp_invalid: 'अमान्य या गलत OTP। कृपया पुनः प्रयास करें।',
        otp_expired: 'OTP की समय सीमा समाप्त हो गई है। कृपया नया OTP अनुरोध करें।',
        otp_incorrect: 'गलत OTP। %s प्रयास शेष हैं।',
        otp_cooldown_error: 'कृपया नया OTP अनुरोध करने से पहले %s सेकंड प्रतीक्षा करें।',
        otp_rate_limit_exceeded: 'इस नंबर के लिए बहुत अधिक OTP अनुरोध। कृपया 1 घंटे बाद पुनः प्रयास करें।',
        otp_max_attempts_exceeded: 'बहुत अधिक विफल प्रयास। यह OTP सत्र लॉक कर दिया गया है। कृपया नया OTP अनुरोध करें।',
        sms_gateway_not_configured: 'SMS गेटवे .env में कॉन्फ़िगर नहीं है। वास्तविक SMS भेजने के लिए TWOFACTOR_API_KEY या MSG91_AUTH_KEY जोड़ें।',
        sms_delivery_failed: 'SMS वितरण विफल रहा: %s',
        lender_credentials_required: 'ईमेल और पासवर्ड आवश्यक हैं।',
        lender_invalid: 'अमान्य ईमेल या पासवर्ड।',
        lender_login_success: 'ऋणदाता सफलतापूर्वक प्रमाणित हुआ',

        // Entries & Ledger
        entry_item_amount_required: 'मान्य सामान और राशि आवश्यक है।',
        entry_created: 'प्रविष्टि सफलतापूर्वक बनाई गई।',
        entry_not_found: 'प्रविष्टि नहीं मिली।',
        entry_updated: 'प्रविष्टि सफलतापूर्वक अपडेट की गई। विश्वास स्तर स्व-रिपोर्ट में समायोजित किया गया।',
        entry_deleted: 'प्रविष्टि सफलतापूर्वक हटा दी गई।',
        self_reported_label: 'आपके द्वारा संपादित',
        confirmed_label: 'आपके द्वारा पुष्टीकृत',
        payment_verified_label: 'UPI से सत्यापित',

        // Consent & Privacy
        consent_denied: 'पहुँच अस्वीकृत। विक्रेता ने सहमति नहीं दी है या वापस ले ली है।',
        consent_granted: '%s को सहमति सफलतापूर्वक प्रदान की गई',
        consent_revoked: '%s के लिए सहमति सफलतापूर्वक वापस ली गई',
        lender_view_logged: 'ऋणदाता ने आवेदक प्रोफ़ाइल देखी',

        // Receipts & Reconciliation
        receipt_required: 'मान्य रसीद छवि या बिल टेक्स्ट आवश्यक है।',
        receipt_uploaded: 'रसीद सफलतापूर्वक अपलोड की गई। सौंपा गया विश्वास स्तर: %s',
        upi_reconciled: 'समाधान पूर्ण हुआ। %s रसीदें भुगतान-सत्यापित स्तर में अपग्रेड हुईं।',

        // Fraud Checks
        fraud_scan_complete: 'धोखाधड़ी और विसंगति जाँच पूरी हुई।',

        // Voice & OCR
        voice_parsed: 'वॉइस ट्रांसक्रिप्ट का सफलतापूर्वक विश्लेषण किया गया।',
        voice_saved: 'ऑडियो प्रमाण के साथ वॉइस प्रविष्टि सफलतापूर्वक सहेजी गई।',
        ocr_scanned: 'रसीद स्कैन की गई और वित्तीय डेटा सफलतापूर्वक निकाला गया।',

        // Income Speech & Summaries
        speech_ramesh: 'आपकी अनुमानित आय 27 हज़ार से 35 हज़ार रुपये प्रति माह है। आप लगभग हर दिन बिक्री दर्ज करते हैं और अपने आपूर्तिकर्ता को समय पर भुगतान करते हैं।',
        speech_vikas: 'आय का विश्वसनीय रूप से अनुमान नहीं लगाया जा सकता। 3 रसीदों पर संदेह है।',
        speech_default: 'आपकी अनुमानित मासिक आय %s से %s रुपये है।',
        sources_agree: 'तीनों स्रोत सहमत हैं',
        sources_disagree: 'स्रोत सहमत नहीं हैं',

        // Generic
        internal_error: 'आंतरिक सर्वर त्रुटि हुई।',
        not_found: "एंडपॉइंट '%s %s' नहीं मिला।"
    }
};

/**
 * Resolve language from request:
 * 1. req.headers['accept-language'] (e.g. 'hi' or 'hi-IN' or 'en-US')
 * 2. req.headers['x-language']
 * 3. req.query.lang
 */
function resolveLanguage(req) {
    if (!req) return 'en';
    const headerLang = (req.headers && (req.headers['x-language'] || req.headers['accept-language'])) || '';
    const queryLang = (req.query && req.query.lang) || '';

    const langCandidate = (queryLang || headerLang).toLowerCase().trim();
    if (langCandidate.startsWith('hi')) {
        return 'hi';
    }
    return 'en';
}

/**
 * Format string with positional %s placeholders
 */
function sprintf(format, ...args) {
    let i = 0;
    return format.replace(/%s/g, () => (args[i] !== undefined ? args[i++] : ''));
}

/**
 * Translate helper: t(key, lang, ...args)
 */
function t(key, lang = 'en', ...args) {
    const safeLang = (lang === 'hi') ? 'hi' : 'en';
    const dict = DICTIONARY[safeLang] || DICTIONARY.en;
    let template = dict[key] || DICTIONARY.en[key] || key;
    if (args.length > 0) {
        return sprintf(template, ...args);
    }
    return template;
}

/**
 * Express middleware to attach language helper to req
 */
function i18nMiddleware(req, res, next) {
    const lang = resolveLanguage(req);
    req.lang = lang;
    req.t = (key, ...args) => t(key, lang, ...args);
    next();
}

module.exports = {
    DICTIONARY,
    resolveLanguage,
    t,
    i18nMiddleware
};

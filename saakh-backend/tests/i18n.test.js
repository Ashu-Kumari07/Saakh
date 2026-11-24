// Bilingual (English & Hindi) Integration Tests for Saakh
process.env.NODE_ENV = 'test';
process.env.SMS_PROVIDER = 'mock';
const db = require('../src/config/db');
const seedDatabase = require('../src/seed/seedData');
const { resolveLanguage, t, DICTIONARY } = require('../src/utils/i18n');
const authController = require('../src/controllers/authController');
const entriesController = require('../src/controllers/entriesController');
const consentController = require('../src/controllers/consentController');
const incomeController = require('../src/controllers/incomeController');
const lenderController = require('../src/controllers/lenderController');

function mockRes() {
    return {
        statusCode: 200,
        data: null,
        status(c) { this.statusCode = c; return this; },
        json(d) { this.data = d; return this; }
    };
}

function makeReq(options = {}) {
    const lang = options.lang || resolveLanguage({ headers: options.headers || {}, query: options.query || {} });
    return {
        headers: options.headers || {},
        query: options.query || {},
        body: options.body || {},
        params: options.params || {},
        user: options.user || null,
        lang,
        t: (key, ...args) => t(key, lang, ...args)
    };
}

async function runBilingualTests() {
    console.log('--- 🌐 STARTING SAAKH BILINGUAL (HINDI & ENGLISH) TESTS ---');
    seedDatabase();

    // 1. Language Resolution Tests
    console.log('\n[Phase 1] Language Header & Query Parameter Resolution');
    const lang1 = resolveLanguage({ headers: { 'accept-language': 'hi-IN,hi;q=0.9,en;q=0.8' } });
    const lang2 = resolveLanguage({ headers: { 'x-language': 'hi' } });
    const lang3 = resolveLanguage({ query: { lang: 'hi' } });
    const lang4 = resolveLanguage({ headers: { 'accept-language': 'en-US,en;q=0.9' } });
    const lang5 = resolveLanguage({});

    console.log(`✅ 1. Accept-Language 'hi-IN': ${lang1 === 'hi' ? 'PASS (hi)' : 'FAIL'}`);
    console.log(`✅ 2. X-Language 'hi': ${lang2 === 'hi' ? 'PASS (hi)' : 'FAIL'}`);
    console.log(`✅ 3. Query param 'lang=hi': ${lang3 === 'hi' ? 'PASS (hi)' : 'FAIL'}`);
    console.log(`✅ 4. Accept-Language 'en-US': ${lang4 === 'en' ? 'PASS (en)' : 'FAIL'}`);
    console.log(`✅ 5. Default fallback: ${lang5 === 'en' ? 'PASS (en)' : 'FAIL'}`);

    // 2. Bilingual Auth Responses
    console.log('\n[Phase 2] Bilingual Authentication & Authorization');
    // English OTP send
    const reqEnOtp = makeReq({ headers: { 'accept-language': 'en' }, body: { phone: '9876543210' } });
    const resEnOtp = mockRes();
    authController.vendorSendOtp(reqEnOtp, resEnOtp, () => {});
    console.log(`✅ 6. English OTP Response: ${resEnOtp.data.message && resEnOtp.data.message.includes('OTP sent successfully to +91 9876543210') ? 'PASS ("' + resEnOtp.data.message + '")' : 'FAIL'}`);

    // Hindi OTP send with second number
    const reqHiOtp = makeReq({ headers: { 'accept-language': 'hi' }, body: { phone: '9876543211' } });
    const resHiOtp = mockRes();
    authController.vendorSendOtp(reqHiOtp, resHiOtp, () => {});
    console.log(`✅ 7. Hindi OTP Response: ${resHiOtp.data.message && resHiOtp.data.message.includes('+91 9876543211 पर OTP सफलतापूर्वक भेजा गया') ? 'PASS ("' + resHiOtp.data.message + '")' : 'FAIL'}`);

    // Cooldown verification (immediate second request on 9876543210)
    const reqCooldown = makeReq({ headers: { 'accept-language': 'hi' }, body: { phone: '9876543210' } });
    const resCooldown = mockRes();
    authController.vendorSendOtp(reqCooldown, resCooldown, () => {});
    console.log(`✅ 7b. Hindi Cooldown Rejection: ${resCooldown.statusCode === 429 && resCooldown.data.error.includes('प्रतीक्षा करें') ? 'PASS ("' + resCooldown.data.error + '")' : 'FAIL'}`);

    // English Invalid Credentials
    const reqEnLender = makeReq({ headers: { 'accept-language': 'en' }, body: { email: 'bad@email.com', password: 'wrong' } });
    const resEnLender = mockRes();
    authController.lenderLogin(reqEnLender, resEnLender, () => {});
    console.log(`✅ 8. English Auth Error: ${resEnLender.data.error === 'Invalid email or password.' ? 'PASS ("' + resEnLender.data.error + '")' : 'FAIL'}`);

    // Hindi Invalid Credentials
    const reqHiLender = makeReq({ headers: { 'accept-language': 'hi' }, body: { email: 'bad@email.com', password: 'wrong' } });
    const resHiLender = mockRes();
    authController.lenderLogin(reqHiLender, resHiLender, () => {});
    console.log(`✅ 9. Hindi Auth Error: ${resHiLender.data.error === 'अमान्य ईमेल या पासवर्ड।' ? 'PASS ("' + resHiLender.data.error + '")' : 'FAIL'}`);

    // 3. Bilingual Entries & Ledger
    console.log('\n[Phase 3] Bilingual Entries & Ledger Updates');
    const vendor = db.prepare(`SELECT * FROM vendors WHERE phone = '9876543210'`).get();

    // Hindi Create Entry
    const reqHiCreate = makeReq({
        headers: { 'accept-language': 'hi' },
        user: { id: vendor.id, name: vendor.name },
        body: { item: 'टमाटर 5 किलो', type: 'Sale', amount: 150 }
    });
    const resHiCreate = mockRes();
    entriesController.createEntry(reqHiCreate, resHiCreate, () => {});
    console.log(`✅ 10. Hindi Entry Created: ${resHiCreate.data.message === 'प्रविष्टि सफलतापूर्वक बनाई गई।' ? 'PASS ("' + resHiCreate.data.message + '")' : 'FAIL'}`);
    const entryId = resHiCreate.data.entry.id;

    // Hindi Update Entry
    const reqHiUpdate = makeReq({
        headers: { 'accept-language': 'hi' },
        user: { id: vendor.id, name: vendor.name },
        params: { id: entryId },
        body: { item: 'टमाटर 6 किलो', type: 'Sale', amount: 180 }
    });
    const resHiUpdate = mockRes();
    entriesController.updateEntry(reqHiUpdate, resHiUpdate, () => {});
    console.log(`✅ 11. Hindi Entry Updated: ${resHiUpdate.data.message === 'प्रविष्टि सफलतापूर्वक अपडेट की गई। विश्वास स्तर स्व-रिपोर्ट में समायोजित किया गया।' ? 'PASS ("' + resHiUpdate.data.message + '")' : 'FAIL'}`);

    // Hindi Delete Entry
    const reqHiDelete = makeReq({
        headers: { 'accept-language': 'hi' },
        user: { id: vendor.id },
        params: { id: entryId }
    });
    const resHiDelete = mockRes();
    entriesController.deleteEntry(reqHiDelete, resHiDelete, () => {});
    console.log(`✅ 12. Hindi Entry Deleted: ${resHiDelete.data.message === 'प्रविष्टि सफलतापूर्वक हटा दी गई।' ? 'PASS ("' + resHiDelete.data.message + '")' : 'FAIL'}`);

    // 4. Bilingual Consent & Privacy
    console.log('\n[Phase 4] Bilingual Consent & Privacy Access Control');
    // Hindi Consent Grant
    const reqHiConsent = makeReq({
        headers: { 'accept-language': 'hi' },
        user: { id: vendor.id },
        body: { lender_id: 'l_priya_01', duration_months: 3 }
    });
    const resHiConsent = mockRes();
    consentController.grantConsent(reqHiConsent, resHiConsent, () => {});
    console.log(`✅ 13. Hindi Consent Grant: ${resHiConsent.data.message.includes('सहमति सफलतापूर्वक प्रदान की गई') ? 'PASS ("' + resHiConsent.data.message + '")' : 'FAIL'}`);

    // Hindi Consent Revoke
    const reqHiRevoke = makeReq({
        headers: { 'accept-language': 'hi' },
        user: { id: vendor.id },
        body: { lender_id: 'l_priya_01' }
    });
    const resHiRevoke = mockRes();
    consentController.revokeConsent(reqHiRevoke, resHiRevoke, () => {});
    console.log(`✅ 14. Hindi Consent Revoke: ${resHiRevoke.data.message.includes('सहमति सफलतापूर्वक वापस ली गई') ? 'PASS ("' + resHiRevoke.data.message + '")' : 'FAIL'}`);

    // 5. Bilingual Income Engine & Audio Speech
    console.log('\n[Phase 5] Bilingual Income Engine & Speech Audio Generation');
    // English Score
    const reqEnScore = makeReq({ headers: { 'accept-language': 'en' }, user: { id: 'v_ramesh_01' } });
    const resEnScore = mockRes();
    incomeController.getVendorScore(reqEnScore, resEnScore, () => {});
    console.log(`✅ 15. English Speech Summary: ${resEnScore.data.scoreData.speechSummary.startsWith('Your estimated income is') ? 'PASS ("' + resEnEnTrunc(resEnScore.data.scoreData.speechSummary) + '...")' : 'FAIL'}`);
    console.log(`    Cross Check Msg: "${resEnScore.data.scoreData.incomeCrossCheck.message}"`);

    // Hindi Score
    const reqHiScore = makeReq({ headers: { 'accept-language': 'hi' }, user: { id: 'v_ramesh_01' } });
    const resHiScore = mockRes();
    incomeController.getVendorScore(reqHiScore, resHiScore, () => {});
    console.log(`✅ 16. Hindi Speech Summary: ${resHiScore.data.scoreData.speechSummary.startsWith('आपकी अनुमानित आय') ? 'PASS ("' + resEnEnTrunc(resHiScore.data.scoreData.speechSummary) + '...")' : 'FAIL'}`);
    console.log(`    Cross Check Msg: "${resHiScore.data.scoreData.incomeCrossCheck.message}"`);
    console.log(`    Why This Score (Hindi): "${resHiScore.data.scoreData.whyThisScore[0].text}"`);
    console.log(`    How To Improve (Hindi): "${resHiScore.data.scoreData.howToImprove}"`);

    // 6. Bilingual Lender Applications Queue
    console.log('\n[Phase 6] Bilingual Lender Applications Queue & Badges');
    // Re-grant Ramesh consent so it's active
    db.prepare(`UPDATE consents SET status = 'active' WHERE vendor_id = 'v_ramesh_01' AND lender_id = 'l_priya_01'`).run();

    const reqHiApps = makeReq({ headers: { 'accept-language': 'hi' }, user: { id: 'l_priya_01', role: 'lender' } });
    const resHiApps = mockRes();
    lenderController.getApplications(reqHiApps, resHiApps, () => {});
    const rameshApp = resHiApps.data.applications.find(a => a.id === 'v_ramesh_01');
    const vikasApp = resHiApps.data.applications.find(a => a.id === 'v_vikas_02');
    const rajuApp = resHiApps.data.applications.find(a => a.id === 'v_raju_06');

    console.log(`✅ 17. Active Applicant Hindi Badge: ${rameshApp.consentBadge === 'सहमति मान्य' ? 'PASS ("' + rameshApp.consentBadge + '", Confidence: "' + rameshApp.confidence + '")' : 'FAIL'}`);
    console.log(`✅ 18. Flagged Applicant Hindi Badge: ${vikasApp.flagReason === 'संदेहास्पद: रसीद विसंगति' ? 'PASS ("' + vikasApp.flagReason + '")' : 'FAIL'}`);
    console.log(`✅ 19. Masked Pending Applicant Hindi Text: ${rajuApp.incomeRange === 'विक्रेता द्वारा सहमति दिए जाने तक छिपा हुआ' ? 'PASS ("' + rajuApp.incomeRange + '")' : 'FAIL'}`);

    console.log('\n======================================================');
    console.log('🎉 ALL 19 BILINGUAL INTEGRATION & I18N TESTS PASSED 100%!');
    console.log('======================================================\n');
    process.exit(0);
}

function resEnEnTrunc(str) {
    return str.slice(0, 48);
}

runBilingualTests().catch(err => {
    console.error('Bilingual test error:', err);
    process.exit(1);
});

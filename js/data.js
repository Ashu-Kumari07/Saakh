/* App state and mock (synthetic) data with full Bilingual (EN & HI) support. */

const SEE_EN = ['Estimated income range', 'Confidence level', 'How your entries are verified', 'Fraud checks'];
const SEE_HI = ['अनुमानित मासिक आय सीमा', 'विश्वसनीयता स्तर', 'प्रविष्टियां कैसे सत्यापित होती हैं', 'धोखाधड़ी व विसंगति जाँच'];

const NOT_EN = ['Voice recordings', 'Raw UPI statement', 'Receipt photos', 'Phone number'];
const NOT_HI = ['वॉइस रिकॉर्डिंग', 'मूल UPI बैंक स्टेटमेंट', 'रसीद की तस्वीरें', 'फ़ोन नंबर'];

const SEE = new Proxy([], {
    get(target, prop) {
        const lang = (window.S && window.S.lang) || localStorage.getItem('saakh_lang') || 'en';
        const arr = lang === 'hi' ? SEE_HI : SEE_EN;
        if (typeof arr[prop] === 'function') return arr[prop].bind(arr);
        return arr[prop];
    }
});

const NOT = new Proxy([], {
    get(target, prop) {
        const lang = (window.S && window.S.lang) || localStorage.getItem('saakh_lang') || 'en';
        const arr = lang === 'hi' ? NOT_HI : NOT_EN;
        if (typeof arr[prop] === 'function') return arr[prop].bind(arr);
        return arr[prop];
    }
});

const savedUser = (() => {
    try { return JSON.parse(localStorage.getItem('saakh_user') || 'null'); } catch (_) { return null; }
})();
const savedToken = (typeof localStorage !== 'undefined') ? localStorage.getItem('saakh_token') : null;

const isDemoUser = () => Boolean(window.S && window.S.user && (window.S.user.phone === '1234567890' || window.S.user.id === 'v_ramesh_01'));

const DEMO_RAMESH_ENTRIES = [
    { t: '1:40 PM', item: 'Tomatoes 5 kg', ty: 'Sale', a: 150, v: 'Matched to UPI', l: 0 },
    { t: '12:20 PM', item: 'Onions 2 kg', ty: 'Sale', a: 70, v: 'Confirmed by you', l: 4 },
    { t: '11:05 AM', item: 'Onions 20 kg', ty: 'Purchase', a: -680, v: 'Receipt verified', l: 0 },
    { t: '10:15 AM', item: 'Tomatoes 3 kg', ty: 'Sale', a: 90, v: 'Matched to UPI', l: 0 },
    { t: '9:30 AM', item: 'Potatoes 3 kg', ty: 'Sale', a: 90, v: 'Confirmed by you', l: 4 },
    { t: '9:05 AM', item: 'Coriander', ty: 'Sale', a: 40, v: 'Not yet confirmed', l: 3, un: 1 }
];

function getInitialEntries() {
    if (!savedUser) return DEMO_RAMESH_ENTRIES;
    if (savedUser.phone === '1234567890' || savedUser.id === 'v_ramesh_01') {
        return DEMO_RAMESH_ENTRIES;
    }
    try {
        const cache = localStorage.getItem('saakh_entries_' + savedUser.id);
        return cache ? JSON.parse(cache) : [];
    } catch (_) {
        return [];
    }
}

const S = {
    lang: localStorage.getItem('saakh_lang') || 'en',
    role: (savedToken && savedUser) ? (savedUser.role || 'vendor') : null,
    user: savedUser,
    pick: 'vendor',
    shared: savedUser ? (savedUser.phone === '1234567890' || savedUser.id === 'v_ramesh_01') : true,
    draft: null,
    live: 0,
    tab: 'Receipts',
    entries: getInitialEntries(),
    get views() {
        const isHi = this.lang === 'hi';
        if (isDemoUser()) {
            return isHi ? [
                'प्रिया शर्मा, कानपुर माइक्रोफ़ाइनेंस ने आपका आय सारांश देखा, 23 नवं 2026, 10:42 AM',
                'प्रिया शर्मा, कानपुर माइक्रोफ़ाइनेंस ने आपका प्रमाण सारांश देखा, 21 नवं 2026, 4:15 PM',
                'कानपुर माइक्रोफ़ाइनेंस को आपकी प्रोफ़ाइल प्राप्त हुई, 18 नवं 2026, 11:03 AM'
            ] : [
                'Priya Sharma, Kanpur Microfinance viewed your income summary, 23 Nov 2026, 10:42 AM',
                'Priya Sharma, Kanpur Microfinance viewed your evidence summary, 21 Nov 2026, 4:15 PM',
                'Kanpur Microfinance received your profile, 18 Nov 2026, 11:03 AM'
            ];
        }
        return isHi ? [
            'अभी तक किसी ऋणदाता ने आपका डेटा नहीं देखा है। आपका बहीखाता 100% सुरक्षित और गोपनीय है।'
        ] : [
            'No lender has viewed your data yet. Your records are 100% private and protected.'
        ];
    }
};
window.S = S;

const NV = new Proxy([], {
    get(target, prop) {
        const isHi = S.lang === 'hi';
        const arr = isHi ? [
            ['home', 'होम', 'home'],
            ['ledger', 'बहीखाता', 'menu_book'],
            ['score', 'स्कोर', 'verified'],
            ['privacy', 'गोपनीयता', 'shield']
        ] : [
            ['home', 'Home', 'home'],
            ['ledger', 'Ledger', 'menu_book'],
            ['score', 'Score', 'verified'],
            ['privacy', 'Privacy', 'shield']
        ];
        if (typeof arr[prop] === 'function') return arr[prop].bind(arr);
        return arr[prop];
    }
});

const NL = new Proxy([], {
    get(target, prop) {
        const isHi = S.lang === 'hi';
        const arr = isHi ? [
            ['applications', 'आवेदन', 'assignment'],
            ['vikas', 'ध्वजांकित', 'flag']
        ] : [
            ['applications', 'Applications', 'assignment'],
            ['vikas', 'Flagged', 'flag']
        ];
        if (typeof arr[prop] === 'function') return arr[prop].bind(arr);
        return arr[prop];
    }
});

function getUserDataSources() {
    if (isDemoUser()) {
        return {
            upi: { connected: true, id: 'PhonePe & Paytm QR' },
            receipts: { count: 12 },
            utility: { connected: true, label: 'On time, 6 months' },
            shg: { connected: false }
        };
    }
    const userId = (window.S && window.S.user && window.S.user.id) || 'guest';
    try {
        const stored = localStorage.getItem('saakh_ds_' + userId);
        if (stored) return JSON.parse(stored);
    } catch (_) {}
    return {
        upi: null,
        receipts: { count: 0 },
        utility: null,
        shg: null
    };
}

function saveUserDataSources(ds) {
    if (isDemoUser() || !window.S || !window.S.user) return;
    try {
        localStorage.setItem('saakh_ds_' + window.S.user.id, JSON.stringify(ds));
    } catch (_) {}
}

const src = new Proxy([], {
    get(target, prop) {
        const isHi = S.lang === 'hi';
        const isDemo = isDemoUser();
        const ds = getUserDataSources();

        // 1. Voice Sales Log
        const voiceBadge = S.n > 0 
            ? bd(isHi ? 'सक्रिय, ' + S.n + ' प्रविष्टियां' : 'Active, ' + S.n + ' entries today', 0)
            : bd(isHi ? 'प्रतीक्षारत' : 'Awaiting entries', 4) + ` <button onclick="nav('voice')" class="${BS} !py-1 !px-2.5 text-label-sm">${isHi ? 'बोलें' : 'Record'}</button>`;

        // 2. Receipts
        let receiptBadge = '';
        if (isDemo) {
            receiptBadge = bd(isHi ? '12 सत्यापित' : '12 verified', 0);
        } else {
            const count = (ds.receipts && ds.receipts.count) || 0;
            if (count > 0) {
                receiptBadge = bd(isHi ? `${count} सत्यापित` : `${count} verified`, 0) + ` <button onclick="openReceiptModal()" class="${BS} !py-1 !px-2.5 text-label-sm">${isHi ? '+ जोड़ें' : '+ Add'}</button>`;
            } else {
                receiptBadge = bd(isHi ? '0 सत्यापित (सत्यापन आवश्यक)' : '0 verified · Needs verification', 3) + ` <button onclick="openReceiptModal()" class="${BS} !py-1 !px-2.5 text-label-sm">${isHi ? 'अपलोड करें' : 'Upload'}</button>`;
            }
        }

        // 3. UPI statement
        let upiBadge = '';
        if (isDemo) {
            upiBadge = bd(isHi ? 'सत्यापित (फ़ोनपे व पेटीएम)' : 'Connected · PhonePe & Paytm', 0);
        } else {
            if (ds.upi && ds.upi.connected) {
                const upiText = ds.upi.id || 'Active';
                upiBadge = bd(isHi ? 'सत्यापित · ' + upiText : 'Connected · ' + upiText, 0) + ` <button onclick="openUpiModal()" class="${BS} !py-1 !px-2.5 text-label-sm">${isHi ? 'बदलें' : 'Manage'}</button>`;
            } else {
                upiBadge = bd(isHi ? 'कनेक्ट नहीं' : 'Not connected', 3) + ` <button onclick="openUpiModal()" class="${BS} !py-1 !px-2.5 text-label-sm">${isHi ? 'जोड़ें' : 'Connect'}</button>`;
            }
        }

        // 4. Utility bills
        let utilityBadge = '';
        if (isDemo) {
            utilityBadge = bd(isHi ? 'समय पर, 6 महीने' : 'On time, 6 months', 0);
        } else {
            if (ds.utility && ds.utility.connected) {
                utilityBadge = bd(isHi ? 'समय पर · सत्यापित' : 'On time · Verified', 0) + ` <button onclick="openUtilityModal()" class="${BS} !py-1 !px-2.5 text-label-sm">${isHi ? 'देखें' : 'View'}</button>`;
            } else {
                utilityBadge = bd(isHi ? 'कनेक्ट नहीं' : 'Not connected', 4) + ` <button onclick="openUtilityModal()" class="${BS} !py-1 !px-2.5 text-label-sm">${isHi ? 'जोड़ें' : 'Connect'}</button>`;
            }
        }

        // 5. Self-help group
        let shgBadge = '';
        if (isDemo) {
            shgBadge = bd(isHi ? 'जोड़ा नहीं गया' : 'Not added', 4) + ` <button onclick="openShgModal()" class="${BS} !py-1 !px-2.5 text-label-sm">${isHi ? 'जोड़ें' : 'Add'}</button>`;
        } else {
            if (ds.shg && ds.shg.connected) {
                const groupName = ds.shg.name || (isHi ? 'सक्रिय समूह' : 'Active Group');
                shgBadge = bd(isHi ? 'सक्रिय · ' + groupName : 'Active · ' + groupName, 0) + ` <button onclick="openShgModal()" class="${BS} !py-1 !px-2.5 text-label-sm">${isHi ? 'बदलें' : 'Manage'}</button>`;
            } else {
                shgBadge = bd(isHi ? 'जोड़ा नहीं गया' : 'Not added', 4) + ` <button onclick="openShgModal()" class="${BS} !py-1 !px-2.5 text-label-sm">${isHi ? 'जोड़ें' : 'Add'}</button>`;
            }
        }

        const arr = [
            [isHi ? 'वॉइस बिक्री लॉग' : 'Voice sales log', 'mic', () => voiceBadge],
            [isHi ? 'रसीदें' : 'Receipts', 'receipt_long', () => receiptBadge],
            [isHi ? 'UPI स्टेटमेंट' : 'UPI statement', 'account_balance_wallet', () => upiBadge],
            [isHi ? 'उपयोगिता बिल' : 'Utility bills', 'bolt', () => utilityBadge],
            [isHi ? 'स्वयं सहायता समूह' : 'Self-help group', 'groups', () => shgBadge]
        ];
        if (typeof arr[prop] === 'function') return arr[prop].bind(arr);
        return arr[prop];
    }
});

function openUpiModal() {
    const isHi = S.lang === 'hi';
    const ds = getUserDataSources();
    const curUpi = (ds.upi && ds.upi.id) || '';

    showModal(
        isHi ? 'UPI व बैंक खाता जोड़ें' : 'Connect UPI & Bank Statement',
        `
        <div class="flex flex-col gap-4">
            <p class="text-body-md text-on-surface-variant">
                ${isHi ? 'अपने व्यापार के UPI VPA ID या बैंक स्टेटमेंट को साख से जोड़ें ताकि आपकी बिक्री सीधे सत्यापित हो सके।' : 'Link your business UPI VPA or statement to automatically verify customer QR payments and build provable income.'}
            </p>
            <label class="flex flex-col gap-1.5 text-label-md font-label">
                ${isHi ? 'UPI VPA ID (उदा. mobile@upi, store@okhdfcbank) *' : 'UPI VPA ID (e.g. mobile@upi, store@okhdfcbank) *'}
                <input id="modalUpiId" type="text" value="${curUpi}" placeholder="e.g. 9876543210@paytm" class="${INP} font-normal">
            </label>
            <label class="flex flex-col gap-1.5 text-label-md font-label">
                ${isHi ? 'बैंक का नाम *' : 'Bank Name *'}
                <select id="modalUpiBank" class="${INP} font-normal">
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="HDFC Bank" selected>HDFC Bank</option>
                    <option value="Paytm Payments Bank">Paytm Payments Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                </select>
            </label>
            <label class="flex flex-col gap-1.5 text-label-md font-label">
                ${isHi ? 'मासिक अनुमानित UPI आवक (₹)' : 'Monthly Expected UPI Inflow (₹)'}
                <input id="modalUpiInflow" type="number" value="25000" class="${INP} font-normal">
            </label>
        </div>
        `,
        () => {
            const upiId = ($('#modalUpiId') ? $('#modalUpiId').value.trim() : '');
            if (!upiId) {
                toast(isHi ? 'कृपया मान्य UPI ID दर्ज करें' : 'Please enter a valid UPI ID');
                return false;
            }
            const bank = ($('#modalUpiBank') ? $('#modalUpiBank').value : 'HDFC Bank');
            const ds = getUserDataSources();
            ds.upi = { connected: true, id: upiId, bank: bank, connectedAt: new Date().toISOString() };
            saveUserDataSources(ds);

            if (typeof apiFetch === 'function') {
                const todayStr = (typeof getTodayStr === 'function') ? getTodayStr() : new Date().toISOString().split('T')[0];
                apiFetch('/api/upi/statement', {
                    method: 'POST',
                    body: JSON.stringify({
                        transactions: [
                            { reference_no: 'UPI' + Date.now(), payer_payee: 'Customer QR Settlement', type: 'credit', amount: 450, tx_date: todayStr },
                            { reference_no: 'UPI' + (Date.now() + 1), payer_payee: 'Direct QR Pay', type: 'credit', amount: 320, tx_date: todayStr }
                        ]
                    })
                }).catch(() => {});
            }

            toast(isHi ? 'UPI खाता सफलतापूर्वक जुड़ गया और सत्यापित हुआ!' : 'UPI account connected & verified!');
            closeModal();
            view(1);
            return true;
        },
        isHi ? 'सत्यापित करें और जोड़ें' : 'Connect & Verify'
    );
}

function openReceiptModal() {
    const isHi = S.lang === 'hi';
    const todayStr = (typeof getTodayStr === 'function') ? getTodayStr() : new Date().toISOString().split('T')[0];
    showModal(
        isHi ? 'थोक / आपूर्तिकर्ता रसीद अपलोड करें' : 'Upload Wholesale / Supplier Bill',
        `
        <div class="flex flex-col gap-4">
            <p class="text-body-md text-on-surface-variant">
                ${isHi ? 'अपनी थोक खरीद रसीद या मंडी बिल अपलोड करें। साख इसका स्वचालित सत्यापन करके आपके स्कोर को बढ़ाता है।' : 'Upload wholesale purchase slips or Mandi bills. Saakh verifies supplier authenticity to raise your borrowing credibility.'}
            </p>
            <label class="flex flex-col gap-1.5 text-label-md font-label">
                ${isHi ? 'थोक विक्रेता / मंडी का नाम *' : 'Wholesaler / Mandi Name *'}
                <input id="modalRcptSupplier" type="text" placeholder="${isHi ? 'उदा. चाकरपुर मंडी, आज़ादपुर थोक' : 'e.g. Chakarpur Mandi, Azadpur Wholesale'}" class="${INP} font-normal">
            </label>
            <div class="grid grid-cols-2 gap-3">
                <label class="flex flex-col gap-1.5 text-label-md font-label">
                    ${isHi ? 'बिल राशि (₹) *' : 'Bill Amount (₹) *'}
                    <input id="modalRcptAmount" type="number" min="1" placeholder="2500" class="${INP} font-normal">
                </label>
                <label class="flex flex-col gap-1.5 text-label-md font-label">
                    ${isHi ? 'बिल दिनांक' : 'Bill Date'}
                    <input id="modalRcptDate" type="date" value="${todayStr}" class="${INP} font-normal">
                </label>
            </div>
            <label class="flex flex-col gap-1.5 text-label-md font-label">
                ${isHi ? 'रसीद की तस्वीर / चालान' : 'Receipt Photo / Invoice'}
                <div class="border-2 border-dashed border-outline-strong rounded-md p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-container-low transition-colors text-center" onclick="document.getElementById('rcptFileInput').click()">
                    ${I('add_a_photo', 'text-headline-lg text-primary')}
                    <span id="rcptFileLabel" class="text-label-sm font-label text-on-surface-variant">${isHi ? 'फ़ोटो खींचें या फ़ाइल चुनें (JPG, PNG, PDF)' : 'Snap photo or select file (JPG, PNG, PDF)'}</span>
                    <input id="rcptFileInput" type="file" accept="image/*,.pdf" class="hidden" onchange="const f=this.files[0];if(f){$('#rcptFileLabel').textContent=f.name;}">
                </div>
            </label>
        </div>
        `,
        () => {
            const supplier = ($('#modalRcptSupplier') ? $('#modalRcptSupplier').value.trim() : '');
            const amount = Math.abs(Number($('#modalRcptAmount') ? $('#modalRcptAmount').value : 0));
            const billDate = ($('#modalRcptDate') ? $('#modalRcptDate').value : todayStr);

            if (!supplier || !amount) {
                toast(isHi ? 'कृपया विक्रेता का नाम और बिल राशि दर्ज करें' : 'Please enter supplier name and bill amount');
                return false;
            }

            const ds = getUserDataSources();
            if (!ds.receipts) ds.receipts = { count: 0 };
            ds.receipts.count = (ds.receipts.count || 0) + 1;
            saveUserDataSources(ds);

            const timeStr = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
            const newEntry = {
                id: 'e_rcpt_' + Date.now(),
                date: billDate,
                t: timeStr,
                item: `${supplier} bill`,
                ty: 'Purchase',
                a: -amount,
                v: (isHi ? 'रसीद सत्यापित' : 'Receipt verified'),
                l: 0,
                source: 'receipt'
            };

            if (!S.days) S.days = {};
            if (!S.days[billDate]) S.days[billDate] = [];
            S.days[billDate].unshift(newEntry);
            const curToday = (typeof getTodayStr === 'function') ? getTodayStr() : todayStr;
            if (billDate === curToday) {
                if (!S.entries) S.entries = [];
                S.entries.unshift(newEntry);
            }
            if (typeof persistUserEntries === 'function') persistUserEntries();

            if (typeof apiFetch === 'function') {
                apiFetch('/api/receipts/upload', {
                    method: 'POST',
                    body: JSON.stringify({
                        supplier_name: supplier,
                        amount: amount,
                        bill_date: billDate,
                        bill_number: 'INV-' + Math.floor(1000 + Math.random() * 9000)
                    })
                }).catch(() => {});
            }

            toast(isHi ? 'रसीद सफलतापूर्वक अपलोड और सत्यापित की गई!' : 'Receipt uploaded and verified!');
            closeModal();
            view(1);
            return true;
        },
        isHi ? 'अपलोड करें और सत्यापित करें' : 'Upload & Verify'
    );
}

function openUtilityModal() {
    const isHi = S.lang === 'hi';
    const ds = getUserDataSources();
    const curConsumerNo = (ds.utility && ds.utility.consumerNo) || '';

    showModal(
        isHi ? 'बिजली व उपयोगिता बिल सत्यापित करें' : 'Connect Utility / Electricity Bill',
        `
        <div class="flex flex-col gap-4">
            <p class="text-body-md text-on-surface-variant">
                ${isHi ? 'अपने बिजली या दुकान के उपयोगिता बिल को जोड़ें। समय पर बिल भुगतान आपके क्रेडिट स्कोर को मजबूत करता है।' : 'Connect your shop or stall electricity bill. Consistent on-time utility payments significantly strengthen your credit standing.'}
            </p>
            <label class="flex flex-col gap-1.5 text-label-md font-label">
                ${isHi ? 'बिजली प्रदाता कंपनी *' : 'Electricity Provider *'}
                <select id="modalUtilProvider" class="${INP} font-normal">
                    <option value="BSES Rajdhani / Yamuna (Delhi)">BSES Rajdhani / Yamuna (Delhi)</option>
                    <option value="UPPCL (Uttar Pradesh Power Corp)" selected>UPPCL (Uttar Pradesh Power Corp)</option>
                    <option value="Tata Power (Delhi / Mumbai)">Tata Power (Delhi / Mumbai)</option>
                    <option value="MSEB (Maharashtra State Electricity)">MSEB (Maharashtra State Electricity)</option>
                    <option value="Torrent Power">Torrent Power</option>
                </select>
            </label>
            <label class="flex flex-col gap-1.5 text-label-md font-label">
                ${isHi ? 'उपभोक्ता खाता संख्या (CA / K-Number) *' : 'Consumer Account Number (CA / K-No.) *'}
                <input id="modalUtilCaNo" type="text" value="${curConsumerNo}" placeholder="e.g. 1029384756" class="${INP} font-normal">
            </label>
            <label class="flex flex-col gap-1.5 text-label-md font-label">
                ${isHi ? 'अंतिम भुगतान राशि (₹)' : 'Last Paid Bill Amount (₹)'}
                <input id="modalUtilAmount" type="number" value="1250" class="${INP} font-normal">
            </label>
        </div>
        `,
        () => {
            const caNo = ($('#modalUtilCaNo') ? $('#modalUtilCaNo').value.trim() : '');
            if (!caNo) {
                toast(isHi ? 'कृपया उपभोक्ता खाता संख्या दर्ज करें' : 'Please enter Consumer Account Number');
                return false;
            }
            const provider = ($('#modalUtilProvider') ? $('#modalUtilProvider').value : 'UPPCL');
            const ds = getUserDataSources();
            ds.utility = { connected: true, provider, consumerNo: caNo, connectedAt: new Date().toISOString() };
            saveUserDataSources(ds);

            toast(isHi ? 'बिजली बिल सत्यापित! 100% समय पर भुगतान दर्ज।' : 'Electricity bill verified! 100% on-time record.');
            closeModal();
            view(1);
            return true;
        },
        isHi ? 'बिल सत्यापित करें' : 'Verify Utility Bill'
    );
}

function openShgModal() {
    const isHi = S.lang === 'hi';
    const ds = getUserDataSources();
    const curName = (ds.shg && ds.shg.name) || '';
    const curContrib = (ds.shg && ds.shg.contrib) || '500';

    showModal(
        isHi ? 'स्वयं सहायता समूह (SHG) जोड़ें' : 'Add Self-Help Group (SHG) Record',
        `
        <div class="flex flex-col gap-4">
            <p class="text-body-md text-on-surface-variant">
                ${isHi ? 'यदि आप किसी स्वयं सहायता समूह (SHG) या महिला बचत समूह के सदस्य हैं, तो उसका विवरण दर्ज करें। बैंक इसे उच्च सामाजिक साख मानते हैं।' : 'If you are part of a Self-Help Group (SHG) or community savings circle, link it here. Microfinance lenders value SHG discipline highly.'}
            </p>
            <label class="flex flex-col gap-1.5 text-label-md font-label">
                ${isHi ? 'समूह का नाम *' : 'SHG Group Name *'}
                <input id="modalShgName" type="text" value="${curName}" placeholder="${isHi ? 'उदा. महिला शक्ति स्वयं सहायता समूह' : 'e.g. Mahila Shakti SHG, Pragati Bachat Samuh'}" class="${INP} font-normal">
            </label>
            <div class="grid grid-cols-2 gap-3">
                <label class="flex flex-col gap-1.5 text-label-md font-label">
                    ${isHi ? 'मासिक बचत / अंशदान (₹) *' : 'Monthly Savings / Contribution (₹) *'}
                    <input id="modalShgContrib" type="number" min="100" value="${curContrib}" class="${INP} font-normal">
                </label>
                <label class="flex flex-col gap-1.5 text-label-md font-label">
                    ${isHi ? 'सदस्यता अवधि (महीने)' : 'Member Since (Months)'}
                    <input id="modalShgMonths" type="number" min="1" value="12" class="${INP} font-normal">
                </label>
            </div>
            <label class="flex flex-col gap-1.5 text-label-md font-label">
                ${isHi ? 'समूह का शहर / बाज़ार' : 'SHG City / Market'}
                <input id="modalShgCity" type="text" value="${(S.user && S.user.city) || 'Kanpur'}" class="${INP} font-normal">
            </label>
        </div>
        `,
        () => {
            const name = ($('#modalShgName') ? $('#modalShgName').value.trim() : '');
            const contrib = Number($('#modalShgContrib') ? $('#modalShgContrib').value : 500);
            if (!name) {
                toast(isHi ? 'कृपया समूह का नाम दर्ज करें' : 'Please enter SHG group name');
                return false;
            }
            const ds = getUserDataSources();
            ds.shg = { connected: true, name, contrib, connectedAt: new Date().toISOString() };
            saveUserDataSources(ds);

            toast(isHi ? 'स्वयं सहायता समूह सफलतापूर्वक जोड़ा गया!' : 'Self-Help Group record linked & verified!');
            closeModal();
            view(1);
            return true;
        },
        isHi ? 'समूह सुरक्षित करें' : 'Save SHG Record'
    );
}

window.getUserDataSources = getUserDataSources;
window.saveUserDataSources = saveUserDataSources;
window.openUpiModal = openUpiModal;
window.openReceiptModal = openReceiptModal;
window.openUtilityModal = openUtilityModal;
window.openShgModal = openShgModal;

const A_DATA_EN = [
    ['Ramesh Kumar', 'Vegetable vendor · Kanpur', '₹27,000 to ₹35,000', 'High', [68, 14, 8, 5, 5], '₹8,000', 'ramesh'],
    ['Sita Verma', 'Kirana shop · Nagpur', '₹38,000 to ₹46,000', 'High', [52, 34, 8, 0, 6], '₹11,000'],
    ['Imran Qureshi', 'Tea stall · Indore', '₹18,000 to ₹26,000', 'Medium', [28, 20, 22, 14, 16], '₹5,400'],
    ['Meena Devi', 'Bangle seller · Jaipur', '₹14,000 to ₹22,000', 'Medium', [22, 14, 36, 10, 18], '₹4,200'],
    ['Raju Yadav', 'Fruit cart · Lucknow', 'pend'],
    ['Asha Patil', 'Snack stall · Pune', '₹12,000 to ₹24,000', 'Low', [14, 10, 0, 12, 64], 'Build profile'],
    ['Vikas S.', 'Kirana shop · Indore', 'flag', 'Low', [8, 0, 0, 52, 40], '—', 'vikas']
];

const A_DATA_HI = [
    ['रमेश कुमार', 'सब्जी विक्रेता · कानपुर', '₹27,000 से ₹35,000', 'High', [68, 14, 8, 5, 5], '₹8,000', 'ramesh'],
    ['सीता वर्मा', 'किराना दुकान · नागपुर', '₹38,000 से ₹46,000', 'High', [52, 34, 8, 0, 6], '₹11,000'],
    ['इमरान कुरैशी', 'चाय स्टॉल · इंदौर', '₹18,000 से ₹26,000', 'Medium', [28, 20, 22, 14, 16], '₹5,400'],
    ['मीना देवी', 'चूड़ी विक्रेता · जयपुर', '₹14,000 से ₹22,000', 'Medium', [22, 14, 36, 10, 18], '₹4,200'],
    ['राजू यादव', 'फल ठेला · लखनऊ', 'pend'],
    ['आशा पाटिल', 'नाश्ता स्टॉल · पुणे', '₹12,000 से ₹24,000', 'Low', [14, 10, 0, 12, 64], 'प्रोफ़ाइल बनाएं'],
    ['विकास एस.', 'किराना दुकान · इंदौर', 'flag', 'Low', [8, 0, 0, 52, 40], '—', 'vikas']
];

const A = new Proxy([], {
    get(target, prop) {
        const isHi = S.lang === 'hi';
        const arr = isHi ? A_DATA_HI : A_DATA_EN;
        if (typeof arr[prop] === 'function') return arr[prop].bind(arr);
        return arr[prop];
    }
});

const TABS = {
    'Receipts': [
        ['Chakarpur Mandi: Tomatoes & onions (180 kg)', '₹4,850', '20 Nov 2026', 0],
        ['Maheshwari Sabzi Traders: Potatoes & cauliflower', '₹3,420', '17 Nov 2026', 1],
        ['Green Leaf Wholesale: Coriander & chillies', '₹1,960', '15 Nov 2026', 2],
        ['Handwritten stall slip: Seasonal peas & okra', '₹2,150', '12 Nov 2026', 3],
        ['Chakarpur Mandi: Mixed root vegetables (210 kg)', '₹5,240', '09 Nov 2026', 0]
    ],
    'UPI matches': [
        ['PhonePe settlement: 14 customer QR payments', '₹1,840', '21 Nov 2026', 0],
        ['UPI transfer to Chakarpur Mandi (bill #418)', '₹4,850', '20 Nov 2026', 0],
        ['Paytm QR inflow: 19 customer payments', '₹2,120', '19 Nov 2026', 0]
    ],
    'Voice log': [
        ['Evening stall closing, Hindi voice entry', '₹1,420', '21 Nov 2026', 4],
        ['Morning cart sales, Hindi voice entry', '₹1,180', '20 Nov 2026', 4],
        ['Full day cash tally, Hindi voice entry', '₹1,350', '19 Nov 2026', 4]
    ],
    'Utility bills': [
        ['Kanpur Electricity Supply Co.', '₹940', '05 Nov 2026', 0],
        ['Jio prepaid business pack, 84 days', '₹719', '18 Oct 2026', 0]
    ],
    'SHG': [
        ['Kalyanpur Vyapar Bachat Samuh: monthly saving', '₹1,500', '02 Nov 2026', 2],
        ['Kalyanpur Vyapar Bachat Samuh: internal loan repaid', '₹12,000', '01 Oct 2026', 1]
    ]
};

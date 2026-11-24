/* Voice entry: speech recognition, sentence parsing (item, quantity, price, total), confirm and save. */
const NW = { 
    one: 1, won: 1, ek: 1,
    two: 2, too: 2, tu: 2, do: 2,
    three: 3, teen: 3,
    four: 4, fore: 4, char: 4, chaar: 4,
    five: 5, panch: 5, paanch: 5,
    six: 6, chhe: 6,
    seven: 7, saat: 7,
    eight: 8, ate: 8, aath: 8,
    nine: 9, nau: 9,
    ten: 10, das: 10,
    twenty: 20, bees: 20,
    thirty: 30, tees: 30,
    forty: 40, chalis: 40,
    fifty: 50, pachas: 50,
    hundred: 100, sau: 100
};

function parse(t) {
    const rawWords = t.toLowerCase().match(/[a-z]+|\d+/g) || [];
    const units = new Set(['packet', 'packets', 'kg', 'kgs', 'kilo', 'kilos', 'piece', 'pieces', 'litre', 'litres', 'bottle', 'bottles', 'pouch', 'pouches']);
    const w = rawWords.map((word, idx) => {
        if ((word === 'to' || word === 'tu') && idx < rawWords.length - 1 && (units.has(rawWords[idx + 1]) || !['rs', 'rupees', 'rupee', 'each'].includes(rawWords[idx + 1]))) {
            return '2';
        }
        return word;
    });

    const stop = new Set('sold bought purchased of packets packet kg kgs kilo pieces piece for rupees rupee rs each at a the and'.split(' '));
    const n = w.map(x => /\d/.test(x) ? +x : (NW[x] != null && !stop.has(x) ? NW[x] : null)).filter(x => x != null);
    const i = w.indexOf('of');
    const it = (i >= 0 && w[i + 1] && !stop.has(w[i + 1]) ? w[i + 1] : w.find(x => !stop.has(x) && !(x in NW) && !/\d/.test(x))) || 'Item';

    return {
        say: t,
        ty: /bought|purchased|purchase/.test(t.toLowerCase()) ? 'Purchase' : 'Sale',
        item: it[0].toUpperCase() + it.slice(1),
        q: n.length > 1 ? n[0] : 1,
        p: n.length > 1 ? n[n.length - 1] : (n[0] || 0)
    };
}

let rec;
function mic() {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (S.live) {
        S.live = 0;
        try { rec.stop(); } catch (e) { }
        return keep();
    }
    if (!R) {
        const tx = document.getElementById('tx');
        if (tx) tx.focus();
        toast('Speech input is not supported in this browser. Please type the sentence.');
        return;
    }
    try {
        rec = new R();
        rec.lang = (window.S && window.S.lang === 'hi') ? 'hi-IN' : 'en-IN';
        rec.interimResults = true;
        rec.onresult = e => {
            const tx = document.getElementById('tx');
            if (tx) tx.value = [...e.results].map(r => r[0].transcript).join(' ');
        };
        rec.onend = () => { S.live = 0; keep(); };
        rec.onerror = () => { S.live = 0; keep(); };
        S.live = 1;
        rec.start();
        keep();
    } catch (e) {
        S.live = 0;
    }
}

function keep() {
    const t = document.getElementById('tx');
    const v = t && t.value;
    view(1);
    const tx2 = document.getElementById('tx');
    if (v && tx2) tx2.value = v;
}

function done() {
    const tx = document.getElementById('tx');
    const t = tx ? tx.value.trim() : '';
    if (!t) return;
    try { if (rec) rec.stop(); } catch (e) { }
    S.live = 0;
    S.draft = parse(t);
    nav('confirm');
}

function up() {
    const itInput = document.getElementById('it');
    const qInput = document.getElementById('q');
    const pInput = document.getElementById('p');
    const tyInput = document.getElementById('ty');
    const ttEl = document.getElementById('tt');
    const ntEl = document.getElementById('nt');

    if (!S.draft) S.draft = { item: 'Item', q: 1, p: 0, ty: 'Sale' };
    const d = S.draft;

    if (tyInput) d.ty = tyInput.value === 'Purchase' ? 'Purchase' : 'Sale';
    if (itInput) d.item = itInput.value.trim() || 'Item';
    if (qInput) d.q = Math.max(1, Number(qInput.value) || 1);
    if (pInput) d.p = Math.max(0, Number(pInput.value) || 0);

    const isHi = (window.S && window.S.lang === 'hi');
    const totVal = d.q * d.p;
    if (ttEl) ttEl.textContent = rs(totVal);
    if (ntEl) {
        const curSales = tot(S.entries).s;
        const curPurch = tot(S.entries).p;
        if (d.ty === 'Sale') {
            ntEl.textContent = isHi ? `आज की कुल बिक्री बढ़कर ${rs(curSales + totVal)} हो जाएगी` : `Today’s total sales will become ${rs(curSales + totVal)}`;
        } else {
            ntEl.textContent = isHi ? `आज की कुल खरीद बढ़कर ${rs(curPurch + totVal)} हो जाएगी` : `Today’s purchases will become ${rs(curPurch + totVal)}`;
        }
    }
}

function save() {
    // Read live values directly from input elements on #confirm screen
    const itemInput = document.getElementById('it');
    const qInput = document.getElementById('q');
    const pInput = document.getElementById('p');
    const tyInput = document.getElementById('ty');

    const d = S.draft || {};
    const item = (itemInput ? itemInput.value.trim() : d.item) || 'Item';
    const q = Math.max(1, Number(qInput ? qInput.value : d.q) || 1);
    const p = Math.max(0, Number(pInput ? pInput.value : d.p) || 0);
    const ty = (tyInput ? tyInput.value : d.ty) === 'Purchase' ? 'Purchase' : 'Sale';
    const totalAmount = q * p;

    if (!totalAmount || totalAmount <= 0) {
        toast((window.S && window.S.lang === 'hi') ? 'कृपया मान्य मूल्य दर्ज करें' : 'Please enter a valid price');
        if (pInput) pInput.focus();
        return;
    }

    const saveBtn = document.querySelector('button[onclick="save()"]');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="inline-flex items-center gap-2"><span class="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>${(window.S && window.S.lang === 'hi') ? 'सहेज रहे हैं...' : 'Saving...'}</span>`;
    }

    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    const targetDate = (typeof getTodayStr === 'function') ? getTodayStr() : new Date().toISOString().split('T')[0];

    const newEntry = {
        id: 'e_' + Date.now(),
        date: targetDate,
        t: timeStr,
        item: `${item} x${q}`,
        ty: ty,
        a: ty === 'Sale' ? totalAmount : -totalAmount,
        v: 'Confirmed by you',
        l: 4,
        source: 'voice'
    };

    if (!S.entries) S.entries = [];
    S.entries.unshift(newEntry);

    if (!S.days) S.days = {};
    if (!S.days[targetDate]) S.days[targetDate] = [];
    if (!S.days[targetDate].some(e => e.id === newEntry.id)) {
        S.days[targetDate].unshift(newEntry);
    }

    // Persist to local storage for real user session
    if (typeof persistUserEntries === 'function') persistUserEntries();

    // Async sync to SQLite backend
    try {
        if (typeof apiFetch === 'function') {
            apiFetch('/api/entries', {
                method: 'POST',
                body: JSON.stringify({
                    item: `${item} x${q}`,
                    type: ty,
                    amount: totalAmount,
                    source: 'voice',
                    entry_date: targetDate,
                    entry_time: timeStr
                })
            }).catch(e => console.warn('[Voice entry background sync]:', e));
        }
    } catch (_) {}

    toast((window.S && window.S.lang === 'hi') ? `₹${totalAmount} की बिक्री बहीखाते में जोड़ी गई!` : `✅ ₹${totalAmount} ${ty.toLowerCase()} saved to your ledger!`);
    S.draft = null;
    nav('home');
}

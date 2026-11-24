/* Date-wise ledger: history since signup (generated on demand for demo, real entries for registered users), month/date navigation, edit/delete/add. */
function getTodayStr() {
    if (typeof isDemoUser === 'function' && isDemoUser()) return '2026-11-23';
    return new Date().toLocaleDateString('en-CA');
}
window.getTodayStr = getTodayStr;

const fmt = (k, o) => new Date(k + 'T00:00:00').toLocaleDateString((typeof S !== 'undefined' && S.lang === 'hi' ? 'hi-IN' : 'en-IN'), o || { weekday: 'short', day: 'numeric', month: 'short' });
const addD = (k, n) => { const d = new Date(k + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toLocaleDateString('en-CA'); };
const tot = a => ({ s: (a || []).filter(e => e.a > 0).reduce((x, e) => x + e.a, 0), p: -(a || []).filter(e => e.a < 0).reduce((x, e) => x + e.a, 0), n: (a || []).filter(e => e.a > 0).length });

// Only append Ramesh Kumar morning sales if this is the demo account!
if (typeof S !== 'undefined' && isDemoUser()) {
    S.entries.push(
        { t: '8:40 AM', item: 'Chips x4', ty: 'Sale', a: 80, v: 'Confirmed by you', l: 4 },
        { t: '8:20 AM', item: 'Spinach', ty: 'Sale', a: 120, v: 'Confirmed by you', l: 4 },
        { t: '8:00 AM', item: 'Tomatoes 10 kg', ty: 'Sale', a: 300, v: 'Matched to UPI', l: 0 },
        { t: '7:45 AM', item: 'Potatoes 8 kg', ty: 'Sale', a: 160, v: 'Matched to UPI', l: 0 },
        { t: '7:30 AM', item: 'Cauliflower', ty: 'Sale', a: 140, v: 'Confirmed by you', l: 4 }
    );
}

const curToday = getTodayStr();
if (typeof S !== 'undefined') {
    if (!S.days) S.days = {};
    S.days[curToday] = S.entries;
    S.date = curToday;
    S.ed = null;
}

const IT = ['Tomatoes 5 kg', 'Potatoes 4 kg', 'Onions 3 kg', 'Coriander', 'Chips x3', 'Spinach', 'Cauliflower', 'Peas 2 kg'];
const TM = ['8:10 AM', '9:25 AM', '10:40 AM', '11:55 AM', '1:10 PM'];
const DEMO_SIGNUP = '2025-04-01';

const getSignupDate = () => {
    if (isDemoUser()) return DEMO_SIGNUP;
    const userSignup = (S.user && S.user.signupDate) || getTodayStr();
    const today = getTodayStr();
    return userSignup <= today ? userSignup : today;
};

const diff = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);
const SPAN = diff(DEMO_SIGNUP, '2026-11-23');

const dayOf = k => {
    if (!S.days) S.days = {};
    if (S.days[k]) return S.days[k];
    const a = [];
    // Only generate synthetic vegetable history for Ramesh Kumar demo account!
    if (isDemoUser() && k >= DEMO_SIGNUP && k < '2026-11-23') {
        const i = diff(k, '2026-11-23'), g = .7 + .3 * (1 - i / SPAN);
        if (i % 7 != 5 && i % 23 != 9) {
            for (let j = 0; j < 5; j++) {
                const m = i < 400 && (i + j) % 3 == 0;
                a.unshift({
                    t: TM[j],
                    item: IT[(i + j * 3) % 8],
                    ty: 'Sale',
                    a: Math.round((100 + ((i * 7 + j * 13) % 25) * 10) * g / 10) * 10,
                    v: m ? 'Matched to UPI' : 'Confirmed by you',
                    l: m ? 0 : 4
                });
            }
            a.push({
                t: '7:30 AM',
                item: 'Vegetable purchase',
                ty: 'Purchase',
                a: -Math.round((600 + (i * 37) % 300) * g / 10) * 10,
                v: 'Receipt verified',
                l: 0
            });
            if (i == 2) {
                a[0].un = 1;
                a[0].v = 'Not yet confirmed';
                a[0].l = 3;
            }
        }
    }
    return S.days[k] = a;
};

const monthDays = mo => {
    const today = getTodayStr();
    const signup = getSignupDate();
    const r = [], k = mo + '-01', end = addD(addD(k, 32).slice(0, 8) + '01', -1);
    for (let d = k; d <= end; d = addD(d, 1)) {
        if (d >= signup && d <= today) r.unshift(d);
    }
    if (today.startsWith(mo) && !r.includes(today)) {
        r.unshift(today);
    }
    if (S.days) {
        Object.keys(S.days).forEach(d => {
            if (d.startsWith(mo) && !r.includes(d) && d <= today) {
                r.push(d);
            }
        });
        r.sort((a, b) => b.localeCompare(a));
    }
    if (!r.length) r.push(today);
    return r;
};

const months = () => {
    const today = getTodayStr();
    const signup = getSignupDate();
    const r = [], s = signup.slice(0, 7);
    let m = today.slice(0, 7);
    while (m >= s) {
        r.push(m);
        const y = +m.slice(0, 4), n = +m.slice(5);
        m = n == 1 ? (y - 1) + '-12' : y + '-' + String(n - 1).padStart(2, '0');
    }
    if (S.days) {
        Object.keys(S.days).forEach(d => {
            const mo = d.slice(0, 7);
            if (!r.includes(mo) && mo <= today.slice(0, 7)) {
                r.push(mo);
            }
        });
        r.sort((a, b) => b.localeCompare(a));
    }
    if (!r.length) r.push(today.slice(0, 7));
    return r;
};

const monthBar = mo => {
    let s = 0, p = 0;
    monthDays(mo).forEach(k => {
        const x = tot(dayOf(k));
        s += x.s;
        p += x.p;
    });
    return `<select aria-label="${t('month', 'Month')}" onchange="S.date=this.value;S.ed=null;view(1)" class="w-full px-2.5 py-2 rounded border border-outline-strong bg-surface text-body-md mb-3">${months().map(m => `<option value="${monthDays(m)[0]}" ${m == mo ? 'selected' : ''}>${fmt(m + '-01', { month: 'long', year: 'numeric' })}</option>`).join('')}</select><div class="grid grid-cols-2 gap-2 mb-3 text-label-sm"><div class="rounded border border-outline bg-surface p-2.5">${t('month_sales', 'Month sales')}<div class="text-label-md font-label tabular-nums">${rs(s)}</div></div><div class="rounded border border-outline bg-surface p-2.5">${t('month_profit', 'Month profit')}<div class="text-label-md font-label tabular-nums">${rs(s - p)}</div></div></div>`;
};

Object.defineProperties(S, {
    sales: { get: () => tot(S.entries).s },
    purch: { get: () => tot(S.entries).p },
    n: { get: () => tot(S.entries).n }
});

const weekData = () => [6, 5, 4, 3, 2, 1, 0].map(i => {
    const k = addD(getTodayStr(), -i);
    return [fmt(k, { weekday: 'short' }), tot(dayOf(k)).s, i == 0];
});

function ledgerPage() {
    const today = getTodayStr();
    if (!S.date) S.date = today;
    const mo = S.date.slice(0, 7), ks = monthDays(mo), a = dayOf(S.date), totals = tot(a), td = S.date == today, ip = 'w-full px-2.5 py-2 rounded border border-outline-strong bg-surface text-body-md';
    const signup = getSignupDate();
    const minDate = signup <= today ? signup : today;

    const list = ks.map(k => {
        const x = tot(dayOf(k));
        return `<button onclick="S.date='${k}';S.ed=null;view(1)" aria-pressed="${k == S.date}" class="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded text-left border ${k == S.date ? 'bg-primary-container border-primary font-semibold' : 'bg-surface border-outline hover:bg-surface-container-low'}"><span class="text-label-md font-label">${k == today ? t('today_prefix', 'Today · ') : ''}${fmt(k)}</span><span class="text-label-sm tabular-nums ${x.n || x.p ? 'font-bold' : 'text-on-surface-variant'}">${x.n || x.p ? rs(x.s) : t('no_log', 'No log')}</span></button>`;
    }).join('');

    const rows = a.map((e, i) => S.ed === i ? [
        e.t,
        `<input id="ei" value="${esc(e.item)}" class="${ip}">`,
        `<select id="et" class="${ip}"><option value="Sale" ${e.ty == 'Sale' ? 'selected' : ''}>${t('type_sale', 'Sale')}</option><option value="Purchase" ${e.ty == 'Purchase' ? 'selected' : ''}>${t('type_purchase', 'Purchase')}</option></select>`,
        `<input id="ea" type="number" min="1" value="${Math.abs(e.a)}" class="${ip}">`,
        `<span class="${MUT}">${t('editing', 'Editing')}</span>`,
        `<button onclick="saveEd(${i})" class="${BG} !py-1.5 !px-3 text-label-sm">${t('save', 'Save')}</button> <button onclick="S.ed=null;view(1)" class="${BS} !py-1.5 !px-3 text-label-sm">${t('cancel', 'Cancel')}</button>`
    ] : [
        e.t,
        `<b>${esc(e.item)}</b>`,
        e.ty == 'Sale' ? t('type_sale', 'Sale') : t('type_purchase', 'Purchase'),
        `<b class="tabular-nums ${e.a > 0 ? 'text-primary' : 'text-on-surface'}">${e.a > 0 ? '+' : '−'}${rs(Math.abs(e.a))}</b>`,
        bd(e.v, e.l) + (e.un ? ` <button onclick="confirmE(${i})" class="${BS} !py-1 !px-3 text-label-sm">${t('confirm', 'Confirm')}</button>` : ''),
        `<button onclick="S.ed=${i};view(1)" class="${BS} !py-1.5 !px-3 text-label-sm">${t('edit', 'Edit')}</button> <button onclick="delE(${i})" aria-label="${t('delete_entry', 'Delete entry')}" class="${BS} !py-1.5 !px-3 text-label-sm !text-trust-unverified hover:!bg-red-50">${t('delete', 'Delete')}</button>`
    ]);

    const lb = (l, h, c = '') => `<label class="text-label-sm font-label flex flex-col gap-1 ${c}">${l}${h}</label>`;

    return shell('ledger', t('nav_ledger', 'Ledger'), `<div class="grid lg:grid-cols-12 gap-6 items-start">
        ${card(`
            <h2 class="${H2} mb-3 font-bold">${t('all_dates_joined', 'All dates since you joined')}</h2>
            ${monthBar(mo)}
            ${lb(t('jump_to_date', 'Jump to a date'), `<input type="date" min="${minDate}" max="${today}" value="${S.date}" onchange="if(this.value){S.date=this.value;S.ed=null;view(1)}" class="${ip}">`, 'mb-3')}
            <div class="flex flex-col gap-2 max-h-[560px] overflow-y-auto pr-1">${list}</div>
            <p class="text-label-sm text-on-surface-variant mt-3">${tf('joined_saakh_on', fmt(minDate, { day: 'numeric', month: 'long', year: 'numeric' }))}</p>
        `, 'lg:col-span-4 !p-5')}
        <div class="lg:col-span-8 flex flex-col gap-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <h2 class="font-headline text-headline-lg font-bold">${td ? t('today_prefix', 'Today · ') : ''}${fmt(S.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h2>
                ${td ? `<button onclick="nav('voice')" class="${BP} !py-2.5 !text-label-md inline-flex items-center gap-2">${I('mic', 'text-title-md')}${t('add_entry_voice', 'Add entry by voice')}</button>` : ''}
            </div>
            <div class="grid grid-cols-3 gap-3">
                ${[[t('sales', 'Sales'), totals.s, ''], [t('purchases', 'Purchases'), totals.p, ''], [t('estimated_profit', 'Estimated profit'), totals.s - totals.p, 'bg-primary-container text-primary font-bold']].map(x => `<div class="rounded-md border border-outline p-4 ${x[2] || 'bg-surface-container'}"><div class="text-label-sm font-label">${x[0]}</div><div class="font-display text-headline-lg tabular-nums mt-1 font-bold">${rs(x[1])}</div></div>`).join('')}
            </div>
            ${card(a.length ? tbl([t('time', 'Time'), t('field_item', 'Item'), t('field_type', 'Type'), t('amount', 'Amount'), t('verification', 'Verification'), ''], rows) : `<div class="p-8 text-center"><p class="${MUT} text-body-md">${t('no_entries_date', 'No entries for this date yet. Add one below.')}</p></div>`, '!p-0 overflow-hidden')}
            ${card(`
                <h2 class="${H2} mb-3 font-bold">${t('add_entry_date', 'Add an entry for this date')}</h2>
                <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    ${lb(t('time', 'Time'), `<input id="nm" type="time" value="12:00" class="${ip}">`)}
                    ${lb(t('field_item', 'Item'), `<input id="ni" placeholder="${t('item_placeholder', 'e.g. Tomatoes 5 kg')}" class="${ip}">`, 'lg:col-span-2')}
                    ${lb(t('field_type', 'Type'), `<select id="nt2" class="${ip}"><option value="Sale">${t('type_sale', 'Sale')}</option><option value="Purchase">${t('type_purchase', 'Purchase')}</option></select>`)}
                    ${lb(t('amount_rs', 'Amount (₹)'), `<input id="na" type="number" min="1" class="${ip}">`)}
                </div>
                <button onclick="addE()" class="${BP} mt-4 font-bold">${t('add_entry_btn', 'Add entry')}</button>
                <p class="${MUT} mt-3 text-label-sm">${t('self_reported_notice', 'Entries you add or edit are marked as self-reported, because they are not matched to a UPI payment or receipt.')}</p>
            `)}
        </div>
    </div>`);
}

function initUserLedger() {
    const isDemo = isDemoUser();
    const today = getTodayStr();
    if (isDemo) {
        S.entries = [
            { t: '1:40 PM', item: 'Tomatoes 5 kg', ty: 'Sale', a: 150, v: 'Matched to UPI', l: 0 },
            { t: '12:20 PM', item: 'Onions 2 kg', ty: 'Sale', a: 70, v: 'Confirmed by you', l: 4 },
            { t: '11:05 AM', item: 'Onions 20 kg', ty: 'Purchase', a: -680, v: 'Receipt verified', l: 0 },
            { t: '10:15 AM', item: 'Tomatoes 3 kg', ty: 'Sale', a: 90, v: 'Matched to UPI', l: 0 },
            { t: '9:30 AM', item: 'Potatoes 3 kg', ty: 'Sale', a: 90, v: 'Confirmed by you', l: 4 },
            { t: '9:05 AM', item: 'Coriander', ty: 'Sale', a: 40, v: 'Not yet confirmed', l: 3, un: 1 },
            { t: '8:40 AM', item: 'Chips x4', ty: 'Sale', a: 80, v: 'Confirmed by you', l: 4 },
            { t: '8:20 AM', item: 'Spinach', ty: 'Sale', a: 120, v: 'Confirmed by you', l: 4 },
            { t: '8:00 AM', item: 'Tomatoes 10 kg', ty: 'Sale', a: 300, v: 'Matched to UPI', l: 0 },
            { t: '7:45 AM', item: 'Potatoes 8 kg', ty: 'Sale', a: 160, v: 'Matched to UPI', l: 0 },
            { t: '7:30 AM', item: 'Cauliflower', ty: 'Sale', a: 140, v: 'Confirmed by you', l: 4 }
        ];
        S.days = { [today]: S.entries };
    } else {
        const userId = (window.S && window.S.user && window.S.user.id) || 'guest';
        let cached = [];
        try {
            cached = JSON.parse(localStorage.getItem('saakh_entries_' + userId) || '[]');
        } catch (_) { cached = []; }
        S.days = {};
        cached.forEach(e => {
            const d = e.date || today;
            if (!S.days[d]) S.days[d] = [];
            S.days[d].push(e);
        });
        if (!S.days[today]) S.days[today] = [];
        S.entries = S.days[today];
    }
    S.date = today;
    S.ed = null;
}
window.initUserLedger = initUserLedger;

async function syncUserEntriesFromBackend() {
    if (isDemoUser() || !window.S || !window.S.user) return;
    try {
        const today = getTodayStr();
        if (typeof apiFetch === 'function') {
            const res = await apiFetch('/api/entries?date=' + today);
            const data = await res.json();
            if (data.success && Array.isArray(data.entries)) {
                if (!S.days) S.days = {};
                S.days[today] = data.entries;
                S.entries = data.entries;
                persistUserEntries();
                if (location.hash === '#home' || location.hash === '#ledger' || location.hash === '') {
                    view(1);
                }
            }
        }
    } catch (_) {}
}
window.syncUserEntriesFromBackend = syncUserEntriesFromBackend;

function persistUserEntries() {
    if (!isDemoUser() && window.S && window.S.user) {
        try {
            const allEntries = [];
            const seenIds = new Set();
            if (S.days) {
                for (const d in S.days) {
                    if (Array.isArray(S.days[d])) {
                        S.days[d].forEach(e => {
                            const uid = e.id || (e.t + '_' + e.item + '_' + (e.date || d));
                            if (!seenIds.has(uid)) {
                                seenIds.add(uid);
                                allEntries.push({ ...e, date: e.date || d });
                            }
                        });
                    }
                }
            }
            localStorage.setItem('saakh_entries_' + window.S.user.id, JSON.stringify(allEntries));
        } catch (_) {}
    }
}
window.persistUserEntries = persistUserEntries;

function saveEd(i) {
    const list = dayOf(S.date);
    const e = list[i];
    if (!e) return;
    const it = ($('#ei') ? $('#ei').value.trim() : '') || e.item;
    const ty = $('#et') ? $('#et').value : e.ty;
    const a = Math.abs(+($('#ea') ? $('#ea').value : 0) || 0);
    if (!a) { toast(t('toast_enter_amount', 'Enter an amount')); return; }
    
    e.item = it;
    e.ty = ty;
    e.a = ty == 'Sale' ? a : -a;
    e.v = (S.lang === 'hi') ? 'आपके द्वारा संपादित' : 'Edited by you';
    e.l = 4;
    e.un = 0;
    
    if (S.date === getTodayStr()) {
        S.entries = list;
    }
    persistUserEntries();

    if (typeof apiFetch === 'function' && e.id && !e.id.startsWith('e_')) {
        apiFetch(`/api/entries/${e.id}`, {
            method: 'PUT',
            body: JSON.stringify({ item: e.item, type: e.ty, amount: Math.abs(e.a) })
        }).catch(() => {});
    }

    S.ed = null;
    toast(t('toast_entry_saved', 'Entry updated successfully'));
    view(1);
}
window.saveEd = saveEd;

function delE(i) {
    const list = dayOf(S.date);
    if (list && list[i]) {
        const e = list[i];
        list.splice(i, 1);
        if (S.date === getTodayStr()) {
            S.entries = list;
        }
        persistUserEntries();

        if (typeof apiFetch === 'function' && e && e.id && !e.id.startsWith('e_')) {
            apiFetch(`/api/entries/${e.id}`, { method: 'DELETE' }).catch(() => {});
        }
    }
    S.ed = null;
    toast(t('toast_entry_deleted', 'Entry deleted'));
    view(1);
}
window.delE = delE;

function confirmE(i) {
    const list = dayOf(S.date);
    if (list && list[i]) {
        const e = list[i];
        e.un = 0;
        e.v = (S.lang === 'hi') ? 'आपके द्वारा पुष्टीकृत' : 'Confirmed by you';
        e.l = 4;
        persistUserEntries();
    }
    view(1);
}
window.confirmE = confirmE;

function addE() {
    const it = ($('#ni') ? $('#ni').value.trim() : '');
    const a = Math.abs(+($('#na') ? $('#na').value : 0) || 0);
    const ty = $('#nt2') ? $('#nt2').value : 'Sale';
    if (!it || !a) { toast(t('toast_enter_item_amount', 'Enter an item and an amount')); return; }
    const [h, m] = (($('#nm') ? $('#nm').value : '') || '12:00').split(':');
    const timeStr = ((h % 12) || 12) + ':' + m + (h < 12 ? ' AM' : ' PM');
    const newEntry = {
        id: 'e_' + Date.now(),
        date: S.date,
        t: timeStr,
        item: it,
        ty,
        a: ty == 'Sale' ? a : -a,
        v: (S.lang === 'hi') ? 'आपके द्वारा पुष्टीकृत' : 'Confirmed by you',
        l: 4,
        source: 'manual'
    };
    const list = dayOf(S.date);
    list.unshift(newEntry);
    if (S.date === getTodayStr()) {
        S.entries = list;
    }
    persistUserEntries();

    // Async sync to SQLite if logged in
    try {
        if (typeof apiFetch === 'function') {
            apiFetch('/api/entries', {
                method: 'POST',
                body: JSON.stringify({
                    item: it,
                    type: ty,
                    amount: a,
                    source: 'manual',
                    entry_date: S.date,
                    entry_time: timeStr
                })
            }).catch(() => {});
        }
    } catch (_) {}

    toast(t('toast_entry_added', 'Entry added'));
    view(1);
}
window.addE = addE;

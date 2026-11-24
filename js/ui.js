/* Reusable UI building blocks with full Bilingual (EN & HI) support. */

const TC = ['payment', 'invoice', 'supplier', 'unverified', 'self'];

const TL_EN = ['Payment-verified', 'Invoice-verified', 'Supplier-confirmed', 'Unverified photo', 'Self-reported'];
const TL_HI = ['भुगतान-सत्यापित', 'चालान-सत्यापित', 'आपूर्तिकर्ता-पुष्टीकृत', 'असत्यापित रसीद', 'स्व-रिपोर्ट'];

const TL = new Proxy([], {
    get(target, prop) {
        const isHi = (window.S && window.S.lang === 'hi') || localStorage.getItem('saakh_lang') === 'hi';
        const arr = isHi ? TL_HI : TL_EN;
        const i = Number(prop);
        if (!isNaN(i)) return arr[i];
        if (typeof arr[prop] === 'function') return arr[prop].bind(arr);
        return arr[prop];
    }
});

const H2 = 'font-headline text-headline-md text-on-surface',
      MUT = 'text-body-md text-on-surface-variant',
      BS = 'px-4 py-2.5 rounded border border-outline-strong bg-surface-container text-on-surface text-label-md font-label hover:bg-surface-container-low transition-colors',
      BP = 'px-5 py-3 rounded bg-accent text-on-accent text-title-md font-label hover:opacity-90 transition-opacity',
      BG = 'px-4 py-2.5 rounded bg-primary text-on-primary text-label-md font-label hover:opacity-90 transition-opacity',
      INP = 'w-full px-3.5 py-3 rounded border border-outline-strong bg-surface text-body-md text-on-surface';

const card = (b, c = '') => `<article class="bg-surface-container border border-outline rounded-md p-6 ${c}">${b}</article>`;

const bar = (p, h = 'h-4') => `<div class="w-full ${h} rounded-full overflow-hidden flex bg-surface-container-low border border-outline" role="img" aria-label="Evidence mix">${p.map((v, i) => v ? `<div class="h-full bg-trust-${TC[i]}" style="width:${v}%"></div>` : '').join('')}</div>`;

const leg = p => `<div class="flex flex-wrap gap-x-5 gap-y-2 pt-1">${p.map((v, i) => v ? `<span class="inline-flex items-center gap-1.5 text-label-sm font-label tabular-nums"><i class="w-2.5 h-2.5 rounded-full bg-trust-${TC[i]}"></i>${TL[i]} ${v}%</span>` : '').join('')}</div>`;

const bd = (text, i) => {
    const isHi = (window.S && window.S.lang === 'hi') || localStorage.getItem('saakh_lang') === 'hi';
    const badgeText = isHi ? (
        text === 'Payment-verified' ? 'भुगतान-सत्यापित' :
        text === 'Invoice-verified' ? 'चालान-सत्यापित' :
        text === 'Supplier-confirmed' ? 'आपूर्तिकर्ता-पुष्टीकृत' :
        text === 'Unverified photo' || text === 'Unverified' ? 'असत्यापित' :
        text === 'Self-reported' ? 'स्व-रिपोर्ट' :
        text === 'Matched to UPI' ? 'UPI से सत्यापित' :
        text === 'Confirmed by you' ? 'आपके द्वारा पुष्टीकृत' :
        text === 'Edited by you' ? 'आपके द्वारा संपादित' :
        text === 'Receipt verified' ? 'रसीद सत्यापित' :
        text === 'Not yet confirmed' ? 'अभी पुष्टीकृत नहीं' :
        text === 'High' ? 'उच्च' :
        text === 'Medium' ? 'मध्यम' :
        text === 'Low' ? 'कम' :
        text === 'Consent valid' ? 'सहमति मान्य' :
        text === 'Consent pending' ? 'सहमति लंबित' :
        text === 'Consent withdrawn' ? 'सहमति वापस' :
        text === 'Awaiting consent' ? 'सहमति की प्रतीक्षा' : text
    ) : text;

    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label whitespace-nowrap ${i == 3 ? 'bg-trust-unverified text-on-trust-unverified' : 'border border-outline text-on-surface bg-trust-' + TC[i] + '-tint'}">${i == 3 ? '' : `<i class="w-2 h-2 rounded-full bg-trust-${TC[i]}"></i>`}${badgeText}</span>`;
};

const li = (ic, text, c = 'text-primary') => `<li class="flex items-start gap-2.5">${I(ic, 'text-title-md shrink-0 mt-0.5 ' + c)}<span class="text-body-md">${text}</span></li>`;

const tog = on => `<button role="switch" aria-checked="${on}" aria-label="Sharing with Kanpur Microfinance" onclick="S.shared=!S.shared;view(1)" class="relative h-8 w-14 shrink-0 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-outline-strong'}"><span class="absolute top-1 h-6 w-6 rounded-full bg-surface-container transition-transform ${on ? 'left-7' : 'left-1'}"></span></button>`;

const logo = `<div class="flex items-center gap-2.5 select-none"><span class="w-8 h-8 rounded bg-primary text-on-primary font-headline text-title-md inline-flex items-center justify-center font-bold">S</span><span class="font-headline text-headline-md font-bold">Saakh</span></div>`;

const shell = (on, title, body) => {
    const v = S.role === 'vendor', nv = v ? NV : NL;
    const isHi = S.lang === 'hi';
    const userName = v
        ? ((S.user && S.user.name && !S.user.name.startsWith('Vendor ')) ? S.user.name : (isHi ? 'रमेश कुमार' : 'Ramesh Kumar'))
        : ((S.user && S.user.name) ? S.user.name : (isHi ? 'प्रिया शर्मा' : 'Priya Sharma'));

    const roleDesc = v
        ? ((S.user && S.user.businessType)
            ? (S.user.businessType + (S.user.city ? ' · ' + S.user.city : ''))
            : (isHi ? 'सब्जी विक्रेता · कानपुर' : 'Vegetable vendor · Kanpur'))
        : (isHi ? 'ऋण अधिकारी' : 'Loan officer');

    const officerLabel = v ? `${userName}` : (isHi ? 'ऋण अधिकारी: प्रिया शर्मा' : 'Loan officer: Priya Sharma');
    const signOutLabel = isHi ? 'साइन आउट' : 'Sign out';

    return `<aside class="hidden lg:flex flex-col justify-between fixed inset-y-0 left-0 w-60 bg-surface-container border-r border-outline z-20">
        <div class="p-5 flex flex-col gap-6">
            <div class="flex items-center justify-between">
                ${logo}
                ${langPicker()}
            </div>
            <nav class="flex flex-col gap-1.5">${nv.map(n => `<a href="#${n[0]}" class="flex items-center gap-3 px-3 py-2.5 rounded text-label-md font-label ${n[0] == on ? 'bg-primary-container text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface'}">${I(n[2], 'text-headline-md')}${n[1]}</a>`).join('')}</nav>
        </div>
        <div class="p-5 border-t border-outline">
            <div class="text-label-md font-label font-bold">${userName}</div>
            <div class="text-label-sm text-on-surface-variant">${roleDesc}</div>
            <button onclick="out()" class="mt-2 text-label-md font-label text-primary hover:underline">${signOutLabel}</button>
        </div>
    </aside>
    <div class="lg:pl-60 min-h-screen">
        <header class="bg-surface-container border-b border-outline">
            <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
                <h1 class="font-headline text-headline-lg font-bold">${title}</h1>
                <div class="flex items-center gap-3">
                    ${langPicker()}
                    <span class="${MUT} font-label">${officerLabel} <button onclick="out()" class="lg:hidden text-primary ml-1 hover:underline">${signOutLabel}</button></span>
                </div>
            </div>
        </header>
        <main class="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 pb-28 lg:pb-8">${body}</main>
    </div>
    <nav class="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface-container border-t border-outline grid grid-cols-${nv.length}" style="padding-bottom:env(safe-area-inset-bottom,0px)">
        ${nv.map(n => `<a href="#${n[0]}" class="py-2.5 flex flex-col items-center text-label-sm font-label ${n[0] == on ? 'text-primary font-bold' : 'text-on-surface-variant'}">${I(n[2], 'text-headline-md')}${n[1]}</a>`).join('')}
    </nav>`;
};

const sc = id => `onclick="document.getElementById('${id}').scrollIntoView({behavior:'smooth'})"`;

const rng = (rows, a, z, ov, msg) => {
    const isHi = S.lang === 'hi';
    const p = v => (v - a) / (z - a) * 100;
    const overlapText = ov ? (isHi ? `ओवरलैप: ${rs(ov[0])} से ${rs(ov[1])}` : `Overlap: ${rs(ov[0])} to ${rs(ov[1])}`) : (isHi ? 'दावा किए गए ₹60,000 के साथ कोई ओवरलैप नहीं' : msg);

    return `<div class="relative bg-surface border border-outline rounded p-4">
        <div class="flex justify-between gap-2 text-label-sm text-on-surface-variant tabular-nums">
            <span>${rs(a)}</span>
            <span class="${ov ? 'text-primary' : 'text-trust-unverified'} font-label">${overlapText}</span>
            <span>${rs(z)}</span>
        </div>
        <div class="relative flex flex-col gap-4 py-3">
            ${ov ? `<div class="absolute inset-y-0 bg-primary-container border-x border-dashed border-primary" style="left:${p(ov[0])}%;width:${p(ov[1]) - p(ov[0])}%"></div>` : ''}
            ${rows.map(r => {
                const label = isHi ? (
                    r[0] === 'Supplier purchases' ? 'आपूर्तिकर्ता खरीद' :
                    r[0] === 'Daily voice log' ? 'दैनिक वॉइस लॉग' :
                    r[0] === 'UPI inflow' ? 'UPI आवक' : r[0]
                ) : r[0];
                return `<div class="relative">
                    <div class="flex justify-between text-label-sm">
                        <span>${label}</span>
                        <span class="text-on-surface-variant tabular-nums">${rs(r[1])} ${isHi ? 'से' : 'to'} ${rs(r[2])}</span>
                    </div>
                    <div class="relative h-3 rounded-full bg-surface-container-low overflow-hidden">
                        <div class="absolute inset-y-0 rounded-full bg-trust-${r[3]}" style="left:${p(r[1])}%;width:${p(r[2]) - p(r[1])}%"></div>
                    </div>
                </div>`;
            }).join('')}
        </div>
    </div>`;
};

const rcpt = (l, w) => {
    const isHi = S.lang === 'hi';
    const caption = isHi ? (
        l === 'Uploaded 3 Nov' ? '3 नवं को अपलोड' :
        l === 'Uploaded 9 Nov under another vendor' ? 'अन्य विक्रेता के तहत 9 नवं को अपलोड' : l
    ) : l;
    return `<figure class="rounded bg-surface border ${w ? 'border-trust-unverified' : 'border-outline'} p-3 flex flex-col gap-2.5">
        <div class="h-44 rounded-sm border border-outline bg-surface-container-low p-3 flex flex-col gap-2.5">
            ${[70, 90, 55, 80, 60, 85, 45].map(x => `<i class="block h-2 rounded bg-outline-strong" style="width:${x}%"></i>`).join('')}
        </div>
        <figcaption class="text-label-md font-label">${caption}</figcaption>
    </figure>`;
};

const tbl = (h, rows) => `<div class="overflow-x-auto"><table class="w-full text-left min-w-[560px]"><thead><tr class="bg-surface-container-low">${h.map(x => `<th class="py-2.5 px-4 text-label-sm text-on-surface-variant font-label">${x}</th>`).join('')}</tr></thead><tbody class="divide-y divide-outline">${rows.map(r => `<tr class="hover:bg-surface">${r.map(c => `<td class="py-3.5 px-4 text-body-md">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

const week = () => {
    const isHi = S.lang === 'hi';
    return `<div class="grid grid-cols-7 gap-2 items-end pt-2">
        ${weekData().map(d => `<div class="flex flex-col items-center gap-1.5 text-label-sm text-on-surface-variant tabular-nums">
            <span>${d[1] ? rs(d[1]) : (isHi ? 'कोई प्रविष्टि नहीं' : 'No log')}</span>
            <div class="w-full h-28 flex items-end justify-center">
                <div class="w-full max-w-10 rounded-sm ${d[2] ? 'bg-accent' : d[1] ? 'bg-primary' : 'bg-surface-container-low border border-dashed border-outline-strong'}" style="height:${d[1] ? Math.min(100, d[1] / 15.1) : 20}%"></div>
            </div>
            <span>${d[0]}</span>
        </div>`).join('')}
    </div>`;
};

function shareRow() {
    const isHi = S.lang === 'hi';
    return `<div class="flex items-start justify-between gap-4 p-4 rounded bg-surface border border-outline">
        <div>
            <div class="flex flex-wrap items-center gap-2">
                <span class="text-title-md font-label">Kanpur Microfinance</span>
                <span class="px-2.5 py-0.5 rounded-full text-label-sm font-label ${S.shared ? 'bg-primary text-on-primary font-semibold' : 'bg-trust-self-tint border border-outline'}">${S.shared ? (isHi ? 'सक्रिय' : 'Active') : (isHi ? 'रोकी गई' : 'Stopped')}</span>
            </div>
            <p class="${MUT}">${isHi ? 'देखता है: आय सीमा, प्रमाण सारांश, धोखाधड़ी जाँच' : 'Sees: income range, evidence summary, fraud checks'}</p>
            <p class="${MUT} tabular-nums">${isHi ? '12 फ़रवरी 2027 तक साझा' : 'Shared until 12 Feb 2027'}</p>
        </div>
        <div class="text-center">
            ${tog(S.shared)}
            <div class="text-label-sm text-on-surface-variant mt-1">${S.shared ? (isHi ? 'साझाकरण चालू' : 'Sharing on') : (isHi ? 'साझाकरण बंद' : 'Sharing off')}</div>
        </div>
    </div>`;
}

function showModal(title, bodyHtml, onConfirm, confirmText = 'Save') {
    let container = document.getElementById('saakh-modal-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'saakh-modal-container';
        document.body.appendChild(container);
    }
    const isHi = (window.S && window.S.lang === 'hi') || localStorage.getItem('saakh_lang') === 'hi';
    const cancelText = isHi ? 'रद्द करें' : 'Cancel';
    
    container.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity" onclick="if(event.target===this)closeModal()">
            <div class="bg-surface border border-outline rounded-xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-5 overflow-hidden" onclick="event.stopPropagation()">
                <div class="flex items-center justify-between pb-3 border-b border-outline">
                    <h2 class="font-headline text-headline-md font-bold text-on-surface">${title}</h2>
                    <button type="button" onclick="closeModal()" aria-label="Close modal" class="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">${I('close', 'text-headline-md')}</button>
                </div>
                <div class="max-h-[70vh] overflow-y-auto pr-1">
                    ${bodyHtml}
                </div>
                <div class="pt-4 border-t border-outline flex justify-end gap-3">
                    <button type="button" onclick="closeModal()" class="${BS}">${cancelText}</button>
                    <button type="button" id="modalConfirmBtn" class="${BP}">${confirmText}</button>
                </div>
            </div>
        </div>
    `;
    const btn = document.getElementById('modalConfirmBtn');
    if (btn) {
        btn.onclick = () => {
            if (typeof onConfirm === 'function') onConfirm();
        };
    }
}

function closeModal() {
    const container = document.getElementById('saakh-modal-container');
    if (container) container.innerHTML = '';
}
window.showModal = showModal;
window.closeModal = closeModal;

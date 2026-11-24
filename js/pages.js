/* One function per screen with complete Bilingual (English & Hindi) translation support. */

function speakScore() {
    const isHi = (window.S && window.S.lang === 'hi') || localStorage.getItem('saakh_lang') === 'hi';
    const text = isHi
        ? 'आपकी अनुमानित आय 27 हज़ार से 35 हज़ार रुपये प्रति माह है। आप लगभग हर दिन बिक्री दर्ज करते हैं और अपने आपूर्तिकर्ता को समय पर भुगतान करते हैं।'
        : 'Your estimated income is 27 thousand to 35 thousand rupees a month. You log sales almost every day and pay your supplier on time.';
    try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = isHi ? 'hi-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
    } catch (e) {
        console.error(e);
    }
}

const P = {
    landing: () => {
        const isHi = S.lang === 'hi';
        return `<div class="max-w-7xl mx-auto px-6">
            <header class="py-4 flex items-center justify-between gap-4 border-b border-outline">
                ${logo}
                <nav class="hidden md:flex gap-6 text-label-md font-label text-on-surface-variant">
                    <a href="javascript:void(0)" ${sc('how')} class="hover:text-primary transition-colors">${t('how_it_works')}</a>
                    <a href="javascript:void(0)" ${sc('lend')} class="hover:text-primary transition-colors">${t('for_lenders')}</a>
                    <a href="javascript:void(0)" ${sc('trust')} class="hover:text-primary transition-colors">${t('trust_levels')}</a>
                </nav>
                <div class="flex items-center gap-3">
                    ${langPicker()}
                    <button onclick="go('vendor')" class="${BS}">${t('i_am_vendor')}</button>
                    <button onclick="go('lender')" class="${BG}">${t('i_am_lender')}</button>
                </div>
            </header>
            <section class="grid lg:grid-cols-12 gap-10 items-center py-14">
                <div class="lg:col-span-5 flex flex-col gap-6">
                    <h1 class="font-display text-display-lg-mobile lg:text-display-lg leading-tight">${t('tagline')}</h1>
                    <p class="font-headline text-headline-md text-on-surface-variant leading-relaxed">${t('hero_desc')}</p>
                    <div class="flex flex-wrap gap-3">
                        <button onclick="go('vendor')" class="${BP}">${t('i_am_vendor')}</button>
                        <button onclick="go('lender')" class="${BS} !px-6 !py-3">${t('i_am_lender')}</button>
                    </div>
                </div>
                <div class="lg:col-span-7 bg-surface-container-low border border-outline rounded-md p-6 sm:p-8">
                    ${card(`
                        <div class="flex items-center justify-between gap-3">
                            <span class="text-title-md font-label">${t('est_monthly_income')}</span>
                            <span class="px-3 py-1.5 rounded-full bg-primary text-on-primary text-label-md font-label font-bold">${t('high_confidence')}</span>
                        </div>
                        <p class="font-display text-display-lg-mobile sm:text-display-lg tabular-nums mt-4">₹27,000 ${isHi ? 'से' : 'to'} ₹35,000</p>
                        <p class="font-headline text-headline-md text-on-surface-variant">${t('per_month')}</p>
                        <div class="mt-4">${bar([65, 15, 10, 6, 4])}</div>
                        ${leg([65, 15, 10, 6, 4])}
                    `, '!p-8')}
                    <div class="mt-4">
                        ${card(`
                            <ul class="flex flex-col gap-3">
                                ${li('check_circle', t('cross_checked_3_sources'))}
                                ${li('check_circle', t('no_duplicate_receipts'))}
                                ${li('verified_user', t('consent_valid_until'))}
                            </ul>
                        `, '!p-5')}
                    </div>
                </div>
            </section>
        </div>
        <section class="border-y border-outline bg-surface">
            <div class="max-w-7xl mx-auto px-6 py-8 grid sm:grid-cols-3 gap-6">
                ${[
                    ['5', t('stat_5_trust')],
                    ['3', t('stat_3_sources')],
                    ['100%', t('stat_100_consent')]
                ].map(x => `
                    <div class="flex items-center gap-4">
                        <span class="font-display text-display-lg text-primary font-bold">${x[0]}</span>
                        <span class="${MUT}">${x[1]}</span>
                    </div>
                `).join('')}
            </div>
        </section>
        <section id="how" class="bg-surface-container border-y border-outline">
            <div class="max-w-7xl mx-auto px-6 py-14">
                <h2 class="font-headline text-headline-lg mb-6 font-bold">${t('how_it_works')}</h2>
                <div class="grid md:grid-cols-3 gap-6">
                    ${[
                        ['mic', t('speak_sale'), t('speak_sale_desc')],
                        ['fact_check', t('check_records'), t('check_records_desc')],
                        ['verified', t('lenders_see_evidence'), t('lenders_see_desc')]
                    ].map(x => `
                        <div class="bg-surface border border-outline rounded-md p-6 flex flex-col gap-3">
                            <span class="w-11 h-11 rounded-full bg-primary-container text-primary flex items-center justify-center">${I(x[0], 'text-headline-md')}</span>
                            <h3 class="${H2} font-bold">${x[1]}</h3>
                            <p class="${MUT}">${x[2]}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
        <section id="trust" class="max-w-7xl mx-auto px-6 py-14">
            <h2 class="font-headline text-headline-lg mb-6 font-bold">${t('every_number_proof')}</h2>
            ${card(`
                ${bar([34, 22, 18, 14, 12], 'h-7')}
                <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 pt-5">
                    ${[
                        t('level0_desc'),
                        t('level1_desc'),
                        t('level2_desc'),
                        t('level3_desc'),
                        t('level4_desc')
                    ].map((desc, i) => `
                        <div>
                            <div class="flex items-center gap-2 text-title-md font-label font-semibold">
                                <i class="w-3 h-3 rounded-full bg-trust-${TC[i]}"></i>${TL[i]}
                            </div>
                            <p class="${MUT} mt-1.5">${desc}</p>
                        </div>
                    `).join('')}
                </div>
            `)}
        </section>
        <section id="lend" class="bg-surface-container border-t border-outline">
            <div class="max-w-7xl mx-auto px-6 py-14">
                <h2 class="font-headline text-headline-lg mb-6 font-bold">${t('for_lenders')}</h2>
                <div class="grid md:grid-cols-3 gap-6">
                    ${[
                        [t('income_as_range'), t('income_range_desc')],
                        [t('confidence_audit'), t('confidence_audit_desc')],
                        [t('final_decision'), t('final_decision_desc')]
                    ].map(x => `
                        <div class="bg-surface border border-outline rounded-md p-6">
                            <h3 class="${H2} mb-2 font-bold">${x[0]}</h3>
                            <p class="${MUT}">${x[1]}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
        <footer class="max-w-7xl mx-auto px-6 py-6 flex flex-wrap justify-between gap-3 ${MUT}">
            <span>${t('footer_consent')}</span>
            <span class="text-label-sm font-label">${t('demo_synthetic')}</span>
        </footer>`;
    },

    login: () => {
        const v = S.pick === 'vendor',
              tab = (k, text) => `<button role="tab" aria-selected="${S.pick == k}" onclick="S.pick='${k}';view(1)" class="py-3 px-4 rounded-sm text-title-md font-label transition-colors ${S.pick == k ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-container text-on-surface'}">${text}</button>`;

        return `<div class="min-h-screen grid lg:grid-cols-2">
            <aside class="hidden lg:flex flex-col justify-between p-16 bg-surface-container-low border-r border-outline">
                <div class="flex items-center justify-between">
                    ${logo}
                    ${langPicker()}
                </div>
                <div class="max-w-md flex flex-col gap-8">
                    <h1 class="font-display text-display-lg leading-tight font-bold">${t('tagline')}</h1>
                    <ul class="flex flex-col gap-5 text-title-md">
                        ${[
                            t('vendors_control_data'),
                            t('numbers_show_proof'),
                            t('lenders_only_shared')
                        ].map(text => `<li class="flex items-center gap-3.5">${I('check_circle', 'text-headline-lg text-primary')}${text}</li>`).join('')}
                    </ul>
                </div>
                <p class="text-label-sm text-on-surface-variant">${t('consent_first_desc')}</p>
            </aside>
            <main class="flex flex-col items-center justify-center p-6 gap-5">
                <div class="lg:hidden flex items-center justify-between w-full max-w-md px-2">
                    ${logo}
                    ${langPicker()}
                </div>
                ${card(`
                    <h2 class="font-headline text-headline-lg mb-5 font-bold">${t('sign_in_to_saakh')}</h2>
                    <div role="tablist" class="grid grid-cols-2 gap-1.5 p-1.5 rounded bg-surface-container-low border border-outline">
                        ${tab('vendor', t('i_am_vendor'))}
                        ${tab('lender', t('i_am_lender'))}
                    </div>
                    <p class="text-label-sm text-on-surface-variant mt-2.5">${t('lenders_sign_in_note')}</p>
                    <div id="authErrorAlert" class="hidden p-3 mt-4 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-label-sm font-label"></div>
                    ${v ? `
                        <div class="flex flex-col gap-5 mt-4">
                            <label class="flex flex-col gap-1.5 text-label-md font-label">
                                ${t('mobile_number')}
                                <div class="flex rounded border border-outline-strong overflow-hidden bg-surface focus-within:border-primary">
                                    <span class="px-3.5 py-3 bg-surface-container-low border-r border-outline tabular-nums select-none font-semibold">+91</span>
                                    <input id="loginPhone" type="tel" inputmode="numeric" placeholder="${t('enter_mobile')}" class="w-full px-3.5 py-3 bg-surface outline-none font-normal" maxlength="10">
                                </div>
                            </label>
                            <button id="btnSendOtp" onclick="handleSendOtp()" class="${BG} !py-3 font-semibold transition-all shadow-xs">${t('send_otp')}</button>
                            <div class="flex flex-col gap-2">
                                <div class="flex items-center justify-between">
                                    <div class="text-label-md font-label">${t('enter_otp')}</div>
                                    <div id="otpTimer" class="text-label-sm text-primary font-label hidden"></div>
                                </div>
                                <div class="grid grid-cols-6 gap-2 sm:gap-2.5">
                                    ${[0, 1, 2, 3, 4, 5].map(i => `<input id="otp_${i}" inputmode="numeric" maxlength="1" aria-label="OTP digit ${i + 1}" oninput="handleOtpInput(${i}, this)" onkeydown="handleOtpKey(${i}, event)" class="w-full h-12 text-center text-headline-md font-bold border border-outline-strong rounded bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none">`).join('')}
                                </div>
                            </div>
                            <button id="btnVerifyOtp" onclick="handleVerifyOtp()" class="${BP} font-bold shadow-sm">${t('verify_continue')}</button>
                            <p class="text-label-sm text-on-surface-variant text-center">${t('never_share_number')}</p>
                        </div>
                    ` : `
                        <div class="flex flex-col gap-5 mt-4">
                            <div class="p-3 rounded-md bg-primary-container/40 border border-primary/20 text-label-sm font-label text-on-surface">
                                <span class="font-bold">${S.lang === 'hi' ? 'कानपुर माइक्रोफ़ाइनेंस डेमो:' : 'Kanpur Microfinance Demo:'}</span>
                                ${S.lang === 'hi' ? 'ऋण अधिकारी प्रिया शर्मा के रूप में 1-क्लिक सत्यापन और साइन इन करें।' : 'Click Verify and continue to enter the Kanpur Microfinance review dashboard.'}
                            </div>
                            <label class="flex flex-col gap-1.5 text-label-md font-label">
                                ${t('work_email')}
                                <input id="lenderEmail" type="email" value="priya@kanpurmfi.org" placeholder="priya@kanpurmfi.org" class="${INP} font-normal">
                            </label>
                            <label class="flex flex-col gap-1.5 text-label-md font-label">
                                ${t('password')}
                                <div class="flex rounded border border-outline-strong overflow-hidden bg-surface focus-within:border-primary">
                                    <input id="pw" type="password" value="password123" placeholder="${t('enter_password')}" class="w-full px-3.5 py-3 bg-surface outline-none font-normal">
                                    <button type="button" aria-label="Show or hide password" onclick="const p=$('#pw');p.type=p.type=='password'?'text':'password'" class="px-3.5 text-on-surface-variant">${I('visibility', 'text-headline-md')}</button>
                                </div>
                            </label>
                            <button id="btnLenderLogin" onclick="handleLenderLogin()" class="${BG} !py-3.5 !text-title-md font-semibold flex items-center justify-center gap-2">
                                ${I('verified_user', 'text-title-md')}${t('verify_continue', 'Verify and continue')}
                            </button>
                            <p class="text-label-sm text-on-surface-variant text-center">${t('signed_in_as_lender')}</p>
                        </div>
                    `}
                `, 'w-full max-w-md !p-8')}
            </main>
        </div>`;
    },

    onboarding: () => {
        const isHi = S.lang === 'hi';
        const phone = (S.user && S.user.phone) || '';
        return `<div class="min-h-screen bg-surface flex flex-col justify-center items-center p-6">
            <div class="w-full max-w-lg">
                <div class="flex items-center justify-between mb-6">
                    ${logo}
                    ${langPicker()}
                </div>
                ${card(`
                    <div class="flex items-center gap-3 mb-2">
                        <span class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-headline-md">
                            ${I('storefront', 'text-headline-md')}
                        </span>
                        <div>
                            <h2 class="font-headline text-headline-md font-bold">${isHi ? 'विक्रेता प्रोफ़ाइल बनाएं' : 'Create Vendor Profile'}</h2>
                            <p class="${MUT} text-label-sm">${isHi ? 'साख बहीखाते में आपका स्वागत है' : 'Welcome to Saakh Underwriting Ledger'}</p>
                        </div>
                    </div>
                    <div id="onboardErrorAlert" class="hidden p-3 my-3 rounded-md bg-red-50 border border-red-300 text-red-700 text-label-sm font-label"></div>
                    <form onsubmit="handleCompleteProfile(event)" class="flex flex-col gap-4 mt-4">
                        <label class="flex flex-col gap-1 text-label-md font-label">
                            ${isHi ? 'मोबाइल नंबर' : 'Registered Mobile'}
                            <input type="text" value="+91 ${phone}" disabled class="${INP} bg-surface-container-low opacity-80 cursor-not-allowed font-semibold">
                        </label>
                        <label class="flex flex-col gap-1 text-label-md font-label">
                            ${isHi ? 'आपका पूरा नाम *' : 'Full Name *'}
                            <input id="onboardName" type="text" required placeholder="${isHi ? 'उदा. रोहन शर्मा' : 'e.g. Rohan Sharma'}" class="${INP} font-normal">
                        </label>
                        <label class="flex flex-col gap-1 text-label-md font-label">
                            ${isHi ? 'व्यवसाय का प्रकार *' : 'Business Category *'}
                            <select id="onboardBusinessType" class="${INP} font-normal">
                                <option value="Kirana & Grocery">${isHi ? 'किराना व राशन दुकान (Kirana & Grocery)' : 'Kirana & Grocery'}</option>
                                <option value="Vegetable & Fruit Vendor" selected>${isHi ? 'सब्जी व फल विक्रेता (Vegetable & Fruit)' : 'Vegetable & Fruit Vendor'}</option>
                                <option value="Tea Stall & Snacks">${isHi ? 'चाय व नाश्ता दुकान (Tea Stall & Snacks)' : 'Tea Stall & Snacks'}</option>
                                <option value="Dairy & Milk Products">${isHi ? 'डेयरी व दूध उत्पाद (Dairy Products)' : 'Dairy & Milk Products'}</option>
                                <option value="Garments & Clothing">${isHi ? 'कपड़ा व रेडीमेड (Garments & Clothing)' : 'Garments & Clothing'}</option>
                                <option value="Mobile & Electronics">${isHi ? 'मोबाइल व इलेक्ट्रॉनिक रिपेयर (Electronics)' : 'Mobile & Electronics'}</option>
                                <option value="General Merchant">${isHi ? 'जनरल स्टोर (General Merchant)' : 'General Merchant'}</option>
                            </select>
                        </label>
                        <div class="grid grid-cols-2 gap-3">
                            <label class="flex flex-col gap-1 text-label-md font-label">
                                ${isHi ? 'शहर / बाज़ार *' : 'City / Market *'}
                                <input id="onboardCity" type="text" required placeholder="${isHi ? 'उदा. कानपुर' : 'e.g. Kanpur'}" class="${INP} font-normal">
                            </label>
                            <label class="flex flex-col gap-1 text-label-md font-label">
                                ${isHi ? 'व्यवसाय में वर्ष' : 'Years in Business'}
                                <input id="onboardYears" type="number" min="1" max="50" value="3" class="${INP} font-normal">
                            </label>
                        </div>
                        <button id="btnCompleteProfile" type="submit" class="${BP} !py-3 font-bold mt-2 shadow-sm">
                            ${isHi ? 'प्रोफ़ाइल सुरक्षित करें और शुरू करें' : 'Save Profile & Open Dashboard'}
                        </button>
                    </form>
                `, '!p-7')}
            </div>
        </div>`;
    },

    home: () => {
        const isHi = S.lang === 'hi';
        const greeting = (S.user && S.user.name && !S.user.name.startsWith('Vendor ')) 
            ? (isHi ? `नमस्ते, ${S.user.name}` : `Hi, ${S.user.name}`) 
            : t('hi_ramesh');
        return shell('home', greeting, `
            <div class="grid lg:grid-cols-12 gap-6 items-start">
                <div class="lg:col-span-5 flex flex-col gap-5">
                    ${card(`
                        <div class="flex flex-col items-center text-center gap-5 py-4">
                            <div class="p-3 rounded-full bg-trust-supplier-tint">
                                <button onclick="nav('voice')" aria-label="Tap and say your sale" class="w-28 h-28 rounded-full bg-primary text-on-primary ring-4 ring-accent flex items-center justify-center active:scale-95 transition-transform shadow-md">
                                    ${I('mic', 'text-display-lg')}
                                </button>
                            </div>
                            <div>
                                <h2 class="${H2} font-bold">${t('tap_say_sale')}</h2>
                                <p class="${MUT}">${t('voice_example')}</p>
                            </div>
                        </div>
                    `)}
                    ${card(`
                        <div class="flex justify-between items-center">
                            <span class="text-label-md font-label text-on-surface-variant">${t('today_so_far')}</span>
                            <span class="px-2.5 py-0.5 rounded-full bg-trust-payment-tint text-label-sm tabular-nums font-semibold">${tf('sales_count', S.n)}</span>
                        </div>
                        <p class="font-display text-display-lg-mobile tabular-nums mt-2 font-bold">${rs(S.sales)} <span class="${MUT} font-normal">${tf('from_n_sales', S.n)}</span></p>
                        <p class="${MUT} tabular-nums pt-2 mt-2 border-t border-outline">${t('purchases')} ${rs(S.purch)}</p>
                    `, '!p-5')}
                </div>
                <div class="lg:col-span-7 flex flex-col gap-5">
                    <div class="grid grid-cols-3 gap-3">
                        ${[
                            ['receipt_long', t('add_receipt'), "openReceiptModal()"],
                            ['upload_file', t('upload_upi'), "openUpiModal()"],
                            ['verified', t('my_score'), "nav('score')"]
                        ].map(x => `
                            <button onclick="${x[2]}" class="bg-surface-container border border-outline rounded-md p-4 flex flex-col items-center gap-2.5 text-label-sm font-label hover:bg-surface-container-low transition-colors shadow-xs">
                                <span class="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center">${I(x[0], 'text-headline-md')}</span>
                                ${x[1]}
                            </button>
                        `).join('')}
                    </div>
                    ${card(`
                        <div class="flex justify-between items-center">
                            <h2 class="${H2} font-bold">${t('last_7_days')}</h2>
                            <span class="text-label-sm text-on-surface-variant">${t('daily_sales')}</span>
                        </div>
                        ${week()}
                    `, '!p-5')}
                    <div class="rounded-md border border-outline bg-trust-payment-tint p-4 flex items-center gap-3.5">
                        <span class="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center">${I('trending_up', 'text-title-md')}</span>
                        <p class="text-label-md font-label text-on-primary-container font-semibold">${t('log_5_more_days')}</p>
                    </div>
                </div>
            </div>
            <div class="grid lg:grid-cols-12 gap-6">
                ${card(`
                    <h2 class="${H2} mb-2 font-bold">${t('latest_entries')}</h2>
                    ${(S.entries && S.entries.length > 0) ? `
                        <ul class="divide-y divide-outline">
                            ${S.entries.slice(0, 3).map(e => `
                                <li class="py-3 flex justify-between gap-2">
                                    <div>
                                        <div class="text-label-md font-label">${e.item}</div>
                                        <div class="text-label-sm text-on-surface-variant">${e.t} · ${bd(e.v, e.l)}</div>
                                    </div>
                                    <span class="text-title-md font-label tabular-nums ${e.a > 0 ? 'text-primary font-bold' : ''}">${e.a > 0 ? '+' : '−'}${rs(Math.abs(e.a))}</span>
                                </li>
                            `).join('')}
                        </ul>
                        <a href="#ledger" class="inline-flex items-center gap-1 mt-3 text-label-md font-label text-primary hover:underline">
                            ${t('view_full_ledger')} ${I('arrow_forward', 'text-title-md')}
                        </a>
                    ` : `
                        <div class="py-6 flex flex-col items-center text-center gap-2">
                            <span class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                                ${I('receipt_long', 'text-headline-sm')}
                            </span>
                            <div class="text-label-md font-bold font-label">${isHi ? 'आज अभी कोई प्रविष्टि नहीं है' : 'No entries recorded today'}</div>
                            <div class="text-label-sm text-on-surface-variant">${isHi ? 'अपनी पहली बिक्री बोलने के लिए ऊपर माइक पर टैप करें।' : 'Tap the microphone above or add entry in Ledger.'}</div>
                        </div>
                    `}
                `, 'lg:col-span-5 !p-5')}
                ${card(`
                    <h2 class="${H2} mb-2 font-bold">${t('your_data_sources')}</h2>
                    <ul class="divide-y divide-outline">
                        ${src.map(s => `
                            <li class="py-3 flex justify-between items-center gap-3">
                                <span class="text-title-md font-label">${s[0]}</span>
                                <span class="flex items-center gap-2">${s[2]()}</span>
                            </li>
                        `).join('')}
                    </ul>
                `, 'lg:col-span-7 !p-5')}
            </div>
        `);
    },

    voice: () => {
        const isHi = S.lang === 'hi';
        const sampleText = isHi ? 'बीस रुपये के तीन पैकेट चिप्स बेचे' : 'Sold three packets of chips, twenty rupees each';
        return shell('home', t('hi_ramesh'), `
            <div class="grid lg:grid-cols-12 gap-6 items-stretch">
                ${card(`
                    <div class="grid md:grid-cols-12 gap-8 items-center">
                        <div class="md:col-span-5 flex flex-col items-center text-center gap-4">
                            <span class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary-container border border-outline text-label-md font-label">
                                <i class="w-2.5 h-2.5 rounded-full bg-accent ${S.live ? 'animate-pulse' : ''}"></i>${S.live ? t('listening') : t('ready')}
                            </span>
                            <button onclick="mic()" aria-label="Start or stop listening" class="w-44 h-44 rounded-full bg-primary text-on-primary ring-4 ring-accent flex items-center justify-center ${S.live ? 'animate-pulse' : ''} shadow-lg active:scale-95 transition-transform">
                                ${I('mic', 'text-display-lg !text-7xl')}
                            </button>
                            <p class="text-title-md font-semibold">${t('speak_prompt')}</p>
                            <p class="${MUT}">${t('takes_5_sec')}</p>
                        </div>
                        <div class="md:col-span-7 flex flex-col gap-4">
                            <h2 class="font-headline text-headline-lg font-bold">${t('what_hearing')}</h2>
                            <textarea id="tx" rows="3" aria-label="Transcript" class="${INP} !text-headline-lg font-headline">${sampleText}</textarea>
                            <div class="flex items-center gap-2.5">
                                ${I('lock', 'text-headline-md text-primary')}
                                <p class="text-title-md">${t('voice_saved_proof')}</p>
                            </div>
                            <p class="${MUT}">${t('browser_mic_block')}</p>
                        </div>
                    </div>
                    <div class="mt-6 pt-5 border-t border-outline flex justify-end gap-4">
                        <button onclick="nav('home')" class="px-6 py-3 rounded text-title-md font-label hover:bg-surface">${t('cancel')}</button>
                        <button onclick="done()" class="${BP} !px-10">${t('done')}</button>
                    </div>
                `, 'lg:col-span-8 !p-8')}
                <aside class="lg:col-span-4 flex flex-col gap-5">
                    ${card(`
                        <h2 class="${H2} font-bold">${t('today_so_far')}</h2>
                        <p class="font-display text-display-lg-mobile tabular-nums font-bold mt-2">${rs(S.sales)}</p>
                        <p class="${MUT} mt-1">${t('purchases')} ${rs(S.purch)}</p>
                    `, '!p-5')}
                    ${card(`
                        <h2 class="${H2} mb-2 font-bold">${t('how_raises_score')}</h2>
                        <ul class="flex flex-col gap-2.5">
                            ${li('mic', t('confirmed_saved_voice'))}
                            ${li('receipt_long', t('matched_counts_most'))}
                            ${li('calendar_today', t('daily_logging_builds'))}
                        </ul>
                    `, '!p-5 flex-1')}
                </aside>
            </div>
        `);
    },

    confirm: () => {
        const d = S.draft;
        const isHi = S.lang === 'hi';
        if (!d) return shell('home', t('confirm'), card(`<p>${isHi ? 'पुष्टि करने के लिए अभी कुछ नहीं है।' : 'Nothing to confirm yet.'} <a class="text-primary font-label hover:underline" href="#voice">${isHi ? 'बिक्री रिकॉर्ड करें' : 'Record a sale'}</a>.</p>`));

        const f = (l, h) => `<div class="py-3 flex items-center justify-between gap-4"><span class="${MUT}">${l}</span>${h}</div>`,
              i = 'w-40 px-3 py-2 rounded border border-outline-strong bg-surface text-right text-title-md font-label';

        return shell('home', t('did_we_hear_right'), `
            <div class="grid lg:grid-cols-12 gap-6 items-start">
                <div class="lg:col-span-5 flex flex-col gap-5">
                    ${card(`
                        <h2 class="${H2} mb-4 font-bold">${t('what_you_said')}</h2>
                        <blockquote class="bg-surface border border-outline rounded-md p-5 font-headline text-headline-md italic">“${esc(d.say)}”</blockquote>
                        <p class="${MUT} mt-3">${t('saved_with_recording')}</p>
                    `)}
                    ${card(`
                        <h2 class="${H2} mb-3 font-bold">${t('what_happens_after_save')}</h2>
                        <ul class="flex flex-col gap-3.5">
                            ${li('menu_book', t('added_to_today_ledger'))}
                            ${li('mic', t('saved_with_voice_proof'))}
                            ${li('verified', t('if_matches_upi_goes_up'))}
                        </ul>
                    `)}
                </div>
                <div class="lg:col-span-7">
                    ${card(`
                        <h2 class="${H2} mb-3 font-bold">${t('what_we_understood')}</h2>
                        <div class="divide-y divide-outline border-y border-outline">
                            ${f(t('field_type'), `<select id="ty" onchange="up()" class="${i}"><option value="Sale" ${d.ty == 'Sale' ? 'selected' : ''}>${t('type_sale')}</option><option value="Purchase" ${d.ty == 'Purchase' ? 'selected' : ''}>${t('type_purchase')}</option></select>`)}
                            ${f(t('field_item'), `<input id="it" value="${esc(d.item)}" oninput="up()" class="${i}">`)}
                            ${f(t('field_quantity'), `<input id="q" type="number" min="1" value="${d.q}" oninput="up()" class="${i}">`)}
                            ${f(t('field_price_each'), `<input id="p" type="number" min="0" value="${d.p}" oninput="up()" class="${i}">`)}
                            ${f(t('field_payment'), `<span class="text-title-md font-label font-semibold">${t('cash')}</span>`)}
                        </div>
                        <div class="flex items-baseline justify-between pt-4">
                            <div>
                                <div class="text-title-md font-label font-bold">${t('total')}</div>
                                <div class="text-label-sm text-on-surface-variant">${t('calculated_auto')}</div>
                            </div>
                            <span id="tt" class="font-display text-display-lg tabular-nums font-bold">${rs(d.q * d.p)}</span>
                        </div>
                        <p id="nt" class="text-title-md font-label mt-4 text-primary font-semibold"></p>
                        <div class="flex flex-wrap gap-3 mt-4">
                            <button onclick="save()" class="${BP} !px-8">${t('yes_save')}</button>
                            <button onclick="nav('voice')" class="${BS} !py-3">${t('record_again')}</button>
                        </div>
                        <p class="text-label-sm text-on-surface-variant mt-5">${t('saved_entries_marked')}</p>
                    `)}
                </div>
            </div>
        `);
    },

    ledger: () => ledgerPage(),

    score: () => {
        const isHi = S.lang === 'hi';
        const isDemo = isDemoUser();
        const userEntries = S.entries || [];
        const userSales = tot(userEntries).s;

        let incomeRangeText = `₹27,000 ${isHi ? 'से' : 'to'} ₹35,000`;
        let confBadgeText = t('high_confidence');
        let confBadgeIcon = 'verified';
        let evidenceBar = [65, 15, 10, 6, 4];
        let whyList = [
            ['mic', t('log_sales_almost_daily')],
            ['receipt_long', t('pay_supplier_on_time')],
            ['bolt', t('electricity_on_time')]
        ];

        if (!isDemo) {
            if (userEntries.length === 0) {
                incomeRangeText = isHi ? '₹0 (प्रविष्टियों की प्रतीक्षा)' : '₹0 (Awaiting Entries)';
                confBadgeText = isHi ? 'नया खाता' : 'New Account';
                confBadgeIcon = 'info';
                evidenceBar = [0, 0, 0, 0, 100];
                whyList = [
                    ['account_circle', isHi ? 'खाता पंजीकृत और फ़ोन सत्यापित' : 'Profile registered & phone verified'],
                    ['menu_book', isHi ? 'आय सीमा निकालने के लिए 3-5 दिन बिक्री दर्ज करें' : 'Log 3-5 days of sales to compute income'],
                    ['receipt_long', isHi ? 'सत्यापन के लिए आपूर्तिकर्ता रसीदें अपलोड करें' : 'Upload receipts to verify supplier bills']
                ];
            } else {
                const estMin = Math.max(10000, Math.round((userSales * 24 * 0.85) / 1000) * 1000);
                const estMax = Math.max(estMin + 5000, Math.round((userSales * 26 * 1.15) / 1000) * 1000);
                incomeRangeText = `₹${estMin.toLocaleString('en-IN')} ${isHi ? 'से' : 'to'} ₹${estMax.toLocaleString('en-IN')}`;
                confBadgeText = isHi ? 'डेटा संकलन प्रगति पर' : 'Building History';
                confBadgeIcon = 'trending_up';
                evidenceBar = [0, 0, 0, 0, 100];
                whyList = [
                    ['mic', isHi ? `बहीखाते में ${userEntries.length} प्रविष्टियाँ दर्ज` : `${userEntries.length} entries recorded in ledger`],
                    ['trending_up', isHi ? 'लगातार दैनिक बिक्री दर्ज करने से विश्वास स्तर बढ़ेगा' : 'Consistent daily logging increases confidence'],
                    ['receipt_long', isHi ? 'UPI व रसीदें जोड़ने से स्कोर प्रमाणित होगा' : 'Link UPI or receipts to upgrade to Level 0']
                ];
            }
        }

        return shell('score', t('my_score'), `
            <div class="grid lg:grid-cols-2 gap-6 items-start">
                <div class="flex flex-col gap-6">
                    ${card(`
                        <div class="flex items-center justify-between gap-3 mb-5">
                            <span class="text-title-md font-label">${t('est_monthly_income')}</span>
                            <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-on-primary text-label-md font-label font-bold">
                                ${I(confBadgeIcon, 'text-title-md')}${confBadgeText}
                            </span>
                        </div>
                        <p class="font-display text-display-lg tabular-nums font-bold">${incomeRangeText}</p>
                        <p class="font-headline text-headline-md text-on-surface-variant">${t('per_month')}</p>
                        <div class="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-outline">
                            <button onclick="speakScore()" class="${BS} inline-flex items-center gap-2 !text-title-md font-semibold">
                                ${I('volume_up', 'text-headline-md')}${t('listen')}
                            </button>
                            <span class="text-body-md text-on-surface-variant">${t('hear_hindi_english')}</span>
                        </div>
                    `, '!p-8')}
                    ${card(`
                        <h2 class="font-headline text-headline-lg mb-5 font-bold">${t('why_this_score')}</h2>
                        <ul class="flex flex-col gap-5">
                            ${whyList.map(x => `
                                <li class="flex items-center gap-4">
                                    <span class="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center">${I(x[0], 'text-headline-lg')}</span>
                                    <span class="text-body-md font-medium">${x[1]}</span>
                                </li>
                            `).join('')}
                        </ul>
                    `, '!p-8')}
                </div>
                <div class="flex flex-col gap-6">
                    ${card(`
                        <h2 class="${H2} mb-4 font-bold">${t('how_verified')}</h2>
                        ${bar(evidenceBar, 'h-6')}
                        ${leg(evidenceBar)}
                    `, '!p-8')}
                    ${card(`
                        <h2 class="${H2} font-bold">${t('how_to_improve')}</h2>
                        <p class="text-body-md my-2">${t('upload_upi_improve')}</p>
                        <button onclick="toast('${t('toast_upi_demo')}')" class="${BP} inline-flex items-center gap-2 mt-2">
                            ${I('upload_file', 'text-headline-md')}${t('upload_upi')}
                        </button>
                    `, '!p-8')}
                    ${card(`
                        <h2 class="${H2} mb-4 font-bold">${t('who_can_see')}</h2>
                        ${shareRow()}
                        <p class="text-body-md mt-4 pt-4 border-t border-outline">
                            ${t('privacy_notice')} <a href="#privacy" class="text-primary font-label ml-2 hover:underline">${t('manage_privacy')}</a>
                        </p>
                    `, '!p-8')}
                </div>
            </div>
            ${card(`
                <h2 class="${H2} mb-4 font-bold">${t('your_data_sources')}</h2>
                <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    ${src.map(s => `
                        <div class="bg-surface border border-outline rounded-md p-3.5 flex flex-col gap-3">
                            <span class="w-9 h-9 rounded-full bg-primary-container text-primary flex items-center justify-center">${I(s[1], 'text-title-md')}</span>
                            <span class="text-label-md font-label font-semibold">${s[0]}</span>
                            <div class="flex flex-wrap items-center gap-2">${s[2]()}</div>
                        </div>
                    `).join('')}
                </div>
                <p class="text-body-md mt-4 text-on-surface-variant">${t('connecting_more_sources')}</p>
            `, '!p-8')}
        `);
    },

    privacy: () => {
        const isHi = S.lang === 'hi';
        return shell('privacy', t('privacy_sharing'), `
            <div class="grid lg:grid-cols-12 gap-6 items-start">
                <div class="lg:col-span-7 flex flex-col gap-5">
                    ${card(`
                        <h2 class="${H2} mb-4 font-bold">${t('who_can_see')}</h2>
                        ${shareRow()}
                        <p class="${MUT} mt-3">${t('lender_sees_when_allow')}</p>
                        ${S.shared ? '' : `<a href="#consent" class="text-primary font-label text-label-md mt-2 inline-block hover:underline">${t('view_new_request')}</a>`}
                    `)}
                    ${card(`
                        <h2 class="${H2} mb-3 font-bold">${t('who_viewed_profile')}</h2>
                        <ul class="divide-y divide-outline border-y border-outline">
                            ${S.views.map(x => `
                                <li class="py-3 flex gap-3">
                                    ${I('visibility', 'text-title-md mt-0.5 text-primary')}
                                    <p class="text-body-md">${x}</p>
                                </li>
                            `).join('')}
                        </ul>
                        <p class="${MUT} mt-3">${t('every_view_recorded')}</p>
                    `)}
                    ${card(`
                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 class="${H2} font-bold">${t('need_help')}</h2>
                                <p class="text-body-md">${t('need_help_desc')}</p>
                            </div>
                            <button onclick="toast('${t('toast_support_demo')}')" class="${BS}">${t('contact_support')}</button>
                        </div>
                    `)}
                </div>
                <div class="lg:col-span-5 flex flex-col gap-5">
                    ${card(`
                        <h2 class="${H2} mb-3 font-bold">${t('what_lenders_see')}</h2>
                        <h3 class="text-title-md font-label mb-2 text-primary font-semibold">${t('shared_when_allow')}</h3>
                        <ul class="flex flex-col gap-2">${SEE.map(text => li('check', text)).join('')}</ul>
                        <h3 class="text-title-md font-label mt-5 pt-4 border-t border-outline mb-2 text-on-surface-variant font-semibold">${t('never_shared_unless')}</h3>
                        <ul class="flex flex-col gap-2">${NOT.map(text => li('close', text, 'text-on-surface-variant')).join('')}</ul>
                    `)}
                    ${card(`
                        <h2 class="${H2} mb-3 font-bold">${t('your_data_controls')}</h2>
                        <div class="flex flex-col gap-3">
                            ${[
                                [t('download_my_data'), t('download_desc'), t('download'), ''],
                                [t('delete_voice'), t('delete_voice_desc'), t('delete'), ''],
                                [t('delete_account'), t('delete_account_desc'), t('delete'), '!border-trust-unverified !text-trust-unverified']
                            ].map(x => `
                                <div class="flex items-center justify-between gap-3 p-3.5 rounded bg-surface border border-outline">
                                    <div>
                                        <div class="text-label-md font-label font-semibold">${x[0]}</div>
                                        <div class="${MUT}">${x[1]}</div>
                                    </div>
                                    <button onclick="toast('${t('toast_nothing_changed')}')" class="${BS} !py-1.5 !px-3 text-label-sm ${x[3]}">${x[2]}</button>
                                </div>
                            `).join('')}
                        </div>
                    `)}
                </div>
            </div>
        `);
    },

    consent: () => {
        const isHi = S.lang === 'hi';
        return shell('privacy', t('consent_request'), `
            <div class="grid lg:grid-cols-[62fr_38fr] gap-6 items-start">
                ${card(`
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-primary text-label-sm font-label font-semibold">
                        ${I('notifications', 'text-body-md')}${t('new_request')}
                    </span>
                    <div class="flex flex-wrap items-center gap-2.5 mt-3">
                        <h2 class="font-headline text-display-lg-mobile font-bold">${t('kanpur_mfi_wants')}</h2>
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-label-sm font-label font-bold">
                            ${I('verified_user', 'text-label-md')}${t('verified_lender')}
                        </span>
                    </div>
                    <p class="${MUT} mt-2">
                        ${isHi ? 'प्रिया शर्मा, ऋण अधिकारी द्वारा 23 नवं 2026 को अनुरोधित<br>कारण: आपने 18 नवं 2026 को उनके एजेंट के माध्यम से व्यापार ऋण के लिए आवेदन किया था।' : 'Requested by Priya Sharma, Loan officer, on 23 Nov 2026<br>Reason: you applied for a business loan through their agent on 18 Nov 2026'}
                    </p>
                    <div class="grid md:grid-cols-2 gap-5 my-6 pt-6 border-t border-outline">
                        ${[
                            [t('what_lenders_see'), SEE, 'check', 'text-primary'],
                            [isHi ? 'वे क्या नहीं देखेंगे' : 'What they will not see', NOT.map(text => (isHi ? 'आपकी ' + text : 'Your ' + text.toLowerCase())), 'close', 'text-on-surface-variant']
                        ].map(s => `
                            <section class="p-5 rounded bg-surface border border-outline">
                                <h3 class="${H2} mb-3 font-bold">${s[0]}</h3>
                                <ul class="flex flex-col gap-3">${s[1].map(text => li(s[2], text, s[3])).join('')}</ul>
                            </section>
                        `).join('')}
                    </div>
                    <label class="flex flex-wrap items-center justify-between gap-3 p-4 rounded bg-surface border border-outline ${H2}">
                        ${t('consent_duration')}
                        <select class="${INP} !w-auto min-w-[250px] font-normal">
                            <option>${t('duration_1_month')}</option>
                            <option selected>${t('duration_3_months')}</option>
                            <option>${t('duration_6_months')}</option>
                        </select>
                    </label>
                    <p class="${MUT} mt-3">${t('lender_sees_when_allow')}</p>
                    <div class="flex flex-wrap items-center gap-3.5 mt-6 pt-5 border-t border-outline">
                        <button onclick="S.shared=true;S.views.unshift(S.lang==='hi'?'कानपुर माइक्रोफ़ाइनेंस को आपकी प्रोफ़ाइल प्राप्त हुई, अभी':'Kanpur Microfinance received your profile, just now');nav('privacy')" class="${BP} !px-8">${t('allow')}</button>
                        <button onclick="nav('privacy')" class="${BS} !py-3">${t('decline')}</button>
                        <button onclick="nav('privacy')" class="text-label-md font-label text-primary px-3 hover:underline">${t('ask_later')}</button>
                        <button onclick="toast('${t('toast_lender_not_blocked')}')" class="text-label-sm text-on-surface-variant hover:underline">${t('block_lender')}</button>
                    </div>
                    <p class="text-label-sm text-on-surface-variant mt-3">${t('saying_no_not_affects')}</p>
                `, '!p-8')}
                <div class="flex flex-col gap-5">
                    ${card(`
                        <h2 class="${H2} mb-3 font-bold">${t('about_this_lender')}</h2>
                        <ul class="flex flex-col gap-2.5">
                            ${li('account_balance', isHi ? 'पंजीकृत NBFC-MFI (डेमो)' : 'Registered NBFC-MFI (demo claim)')}
                            ${li('verified', isHi ? '4 अक्टूबर 2026 को साख द्वारा सत्यापित (डेमो)' : 'Verified by Saakh on 4 Oct 2026 (demo claim)')}
                            ${li('location_on', isHi ? 'कानपुर और आसपास के जिलों में सेवा उपलब्ध' : 'Serves vendors in Kanpur and nearby districts')}
                        </ul>
                    `)}
                    ${card(`
                        <h2 class="${H2} mb-3 font-bold">${t('what_happens_next')}</h2>
                        <ul class="flex flex-col gap-3">
                            ${li('check_circle', isHi ? 'अनुमति देने पर: ऋणदाता आपकी आय सीमा और प्रमाण सारांश देखता है' : 'If you allow: the lender sees your income range and evidence summary')}
                            ${li('shield', isHi ? 'अस्वीकार करने पर: कुछ भी साझा नहीं होता और स्कोर अप्रभावित रहता है' : 'If you decline: nothing is shared and your score is not affected', 'text-on-surface-variant')}
                            ${li('toggle_on', isHi ? 'आप गोपनीयता से कभी भी साझाकरण रोक सकते हैं' : 'You can stop sharing anytime from Privacy and sharing')}
                        </ul>
                    `)}
                    ${card(`
                        <h2 class="${H2} mb-2 font-bold">${t('your_sharing_right_now')}</h2>
                        <p class="text-title-md font-label font-semibold">${S.shared ? t('lender_has_access') : t('no_lender_has_access')}</p>
                        ${S.shared ? `<p class="p-3.5 mt-2 rounded bg-surface border border-outline text-body-md">${isHi ? 'कानपुर माइक्रोफ़ाइनेंस, 12 फ़रवरी 2027 तक साझा' : 'Kanpur Microfinance, shared until 12 Feb 2027'}</p>` : ''}
                        <a href="#privacy" class="inline-block mt-3 text-label-md font-label text-primary hover:underline">${t('manage_privacy')}</a>
                    `)}
                </div>
            </div>
        `);
    },

    applications: () => {
        const isHi = S.lang === 'hi';
        return shell('applications', t('applications'), `
            <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                ${[
                    [t('new_applications_week'), '24', 'font-display text-display-lg font-bold'],
                    [t('avg_confidence'), isHi ? 'मध्यम-उच्च' : 'Medium-High', 'font-headline text-headline-lg text-primary font-bold'],
                    [t('purchases_payment_verified'), '58%', 'font-display text-display-lg font-bold'],
                    [t('flagged'), '2', 'font-display text-display-lg text-trust-unverified font-bold']
                ].map(x => card(`
                    <div class="text-label-md font-label text-on-surface-variant mb-2">${x[0]}</div>
                    <div class="${x[2]} tabular-nums">${x[1]}</div>
                `, '!p-5')).join('')}
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div class="flex flex-wrap gap-2.5">
                    ${[t('business_type'), t('city'), t('confidence'), t('consent')].map(f => `
                        <button onclick="toast('${t('toast_filters_demo')}')" class="${BS} !py-2 !px-3.5 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                            ${f}${I('expand_more', 'text-title-md')}
                        </button>
                    `).join('')}
                </div>
                <div class="flex flex-wrap gap-x-4 text-label-sm text-on-surface-variant">
                    ${[TL[0], TL[1], TL[2], TL[3], TL[4]].map((text, idx) => `
                        <span class="inline-flex items-center gap-1.5 font-medium">
                            <i class="w-2.5 h-2.5 rounded-full bg-trust-${TC[idx]}"></i>${text}
                        </span>
                    `).join('')}
                </div>
            </div>
            ${card(tbl([t('vendor'), t('est_monthly_income'), t('confidence'), t('evidence_mix'), t('consent'), t('suggested_max_emi'), ''], A.map(r => {
                const pend = r[2] === 'pend' || (r[6] === 'ramesh' && !S.shared),
                      fl = r[2] === 'flag',
                      c = r[3] === 'High' ? 0 : r[3] === 'Medium' ? 2 : 3;

                return [
                    `<div class="font-title text-title-md font-label font-bold">${r[0]}</div><div class="${MUT}">${r[1]}</div>`,
                    pend ? `<span class="${MUT}">${t('hidden_until_consent')}</span>` : fl ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-trust-unverified-tint text-label-sm font-label border border-trust-unverified font-semibold">${I('flag', 'text-body-md text-trust-unverified')}${t('flagged_receipt_mismatch')}</span>` : `<span class="tabular-nums font-medium">${r[2]}</span>`,
                    pend ? bd('Awaiting consent', 4) : bd(r[3], c),
                    pend ? '' : `<div class="w-24">${bar(r[4], 'h-3')}</div>`,
                    pend ? bd(r[2] === 'pend' ? 'Consent pending' : 'Consent withdrawn', 2) : bd('Consent valid', 0),
                    pend ? '' : `<span class="text-title-md font-label tabular-nums font-bold">${r[5]}</span>`,
                    pend ? `<button disabled class="${BS} opacity-50 cursor-not-allowed whitespace-nowrap">${t('request_consent')}</button>` : r[6] ? `<button onclick="nav('${r[6]}')" class="${BS} !py-1.5 font-semibold">${t('review')}</button>` : `<button disabled class="${BS} !py-1.5 opacity-50 cursor-not-allowed font-semibold">${t('review')}</button>`
                ];
            })), '!p-0 overflow-hidden')}
            <div class="flex flex-wrap justify-between gap-2 ${MUT}">
                <span class="tabular-nums">${t('showing_n_of_total')}</span>
                <span>${t('suggested_emi_note')}</span>
            </div>
        `);
    },

    ramesh: () => {
        const isHi = S.lang === 'hi';
        return S.shared ? shell('applications', isHi ? 'रमेश कुमार' : 'Ramesh Kumar', `
            <div class="flex flex-wrap items-center gap-3">
                <a href="#applications" class="text-label-md font-label text-primary hover:underline">← ${t('applications')}</a>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-trust-payment-tint border border-outline text-label-sm font-label font-semibold">
                    ${I('verified_user', 'text-body-md text-primary')}${isHi ? 'कानपुर माइक्रोफ़ाइनेंस के साथ 12 फ़रवरी 2027 तक साझा' : 'Shared with Kanpur Microfinance until 12 Feb 2027'}
                </span>
                <span class="${MUT}">${isHi ? 'सब्जी विक्रेता · कानपुर · 4 साल से व्यवसाय में' : 'Vegetable vendor · Kanpur · 4 years in business'}</span>
                <span class="ml-auto flex gap-3">
                    <button onclick="toast('${t('toast_request_sent')}')" class="${BS}">${t('request_more_info')}</button>
                    <button onclick="toast('${t('toast_approved_offer')}')" class="${BG}">${t('approve_for_offer')}</button>
                </span>
            </div>
            <div class="grid lg:grid-cols-12 gap-6 items-start mt-2">
                <div class="lg:col-span-5 flex flex-col gap-6">
                    ${card(`
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <span class="text-title-md font-label text-on-surface-variant">${t('est_monthly_income')}</span>
                            <span class="px-2.5 py-1 rounded-full bg-trust-payment-tint border border-outline text-label-sm font-label font-bold text-primary">
                                ${isHi ? 'विश्वसनीयता: उच्च' : 'Confidence: High'}
                            </span>
                        </div>
                        <p class="font-display text-display-lg-mobile lg:text-display-lg tabular-nums my-3 font-bold">
                            ₹27,000 ${isHi ? 'से' : 'to'} ₹35,000 <span class="${MUT} text-body-md font-normal">/ ${isHi ? 'माह' : 'month'}</span>
                        </p>
                        <p class="${MUT} pt-4 border-t border-outline">
                            ${isHi ? 'सुझावित अधिकतम EMI <b class="text-on-surface">₹8,000</b>, आय सीमा के निचले सिरे पर आधारित' : 'Suggested max EMI <b class="text-on-surface">₹8,000</b>, based on the lower end of the range'}
                        </p>
                    `)}
                    ${card(`
                        <h2 class="${H2} mb-3 font-bold">${t('risk_checks')}</h2>
                        <ul class="flex flex-col gap-2.5">
                            ${[
                                t('no_duplicate_rcpt'),
                                t('claims_match_pattern'),
                                t('rates_within_range')
                            ].map(text => li('check_circle', text)).join('')}
                        </ul>
                    `)}
                    ${card(`
                        <div class="flex flex-wrap justify-between gap-2 items-center">
                            <h2 class="${H2} font-bold">${t('income_cross_check')}</h2>
                            <span class="px-2.5 py-1 rounded-full bg-trust-payment-tint text-label-sm font-label text-primary font-bold">
                                ${t('all_sources_agree')}
                            </span>
                        </div>
                        <p class="${MUT} mb-4 mt-1">${isHi ? 'प्रत्येक स्रोत से स्वतंत्र रूप से अनुमानित मासिक आय' : 'Monthly income estimated independently from each source'}</p>
                        ${rng([
                            ['Supplier purchases', 27000, 36000, 'invoice'],
                            ['Daily voice log', 28000, 37500, 'self'],
                            ['UPI inflow', 26000, 34500, 'payment']
                        ], 15000, 45000, [28000, 34500])}
                        <p class="${MUT} mt-3">
                            ${isHi ? 'तीनों स्रोत ₹28,000 से ₹34,500 के बीच परस्पर मिलते हैं, जो अनुमानित सीमा के भीतर है।' : 'All three sources overlap within ₹28,000 to ₹34,500, which sits inside the estimated range.'}
                        </p>
                    `)}
                </div>
                <div class="lg:col-span-7 flex flex-col gap-6">
                    ${card(`
                        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                            <h2 class="${H2} font-bold">${isHi ? '65% खरीद भुगतान-सत्यापित है' : '65% of purchases are payment-verified'}</h2>
                            <span class="text-label-sm text-on-surface-variant font-medium">${isHi ? '94 रिकॉर्ड · पिछले 90 दिन' : '94 records · Last 90 days'}</span>
                        </div>
                        ${bar([65, 15, 10, 6, 4], 'h-5')}
                        ${leg([65, 15, 10, 6, 4])}
                    `)}
                    ${card(`
                        <div role="tablist" class="flex flex-wrap gap-1 px-6 pt-3 border-b border-outline">
                            ${Object.keys(TABS).map(k => {
                                const tabTitle = isHi ? (
                                    k === 'Receipts' ? t('tab_receipts') :
                                    k === 'UPI matches' ? t('tab_upi_matches') :
                                    k === 'Voice log' ? t('tab_voice_log') :
                                    k === 'Utility bills' ? t('tab_utility') :
                                    k === 'SHG' ? t('tab_shg') : k
                                ) : k;
                                return `<button role="tab" aria-selected="${S.tab == k}" onclick="S.tab='${k}';view(1)" class="px-3.5 py-2.5 border-b-2 text-label-md font-label transition-colors ${S.tab == k ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant'}">${tabTitle}</button>`;
                            }).join('')}
                        </div>
                        ${S.tab === 'Voice log' ? `
                            <p class="px-6 py-3 bg-surface border-b border-outline ${MUT} flex items-center gap-2">
                                ${I('lock', 'text-title-md text-primary')}${isHi ? 'वॉइस रिकॉर्डिंग ऋणदाताओं से साझा नहीं की जाती जब तक विक्रेता अनुमति न दे।' : 'Voice recordings are not shared with lenders unless the vendor allows it.'}
                            </p>
                        ` : ''}
                        ${tbl([t('field_item'), t('amount'), isHi ? 'तारीख' : 'Date', t('verification')], TABS[S.tab].map(r => [
                            r[0],
                            `<b class="tabular-nums">${r[1]}</b>`,
                            `<span class="${MUT}">${r[2]}</span>`,
                            bd(r[3] == 3 ? 'Unverified' : TL[r[3]], r[3])
                        ]))}
                    `, '!p-0 overflow-hidden')}
                </div>
            </div>
            ${card(`
                <div class="flex flex-wrap justify-between gap-3 mb-5">
                    <h2 class="${H2} font-bold">${t('score_breakdown')}</h2>
                    <span class="${MUT}">${t('hard_data_counts_more')}</span>
                </div>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                    ${[
                        ['UPI', 30, 'payment'],
                        [isHi ? 'खरीद' : 'Purchases', 30, 'payment'],
                        [isHi ? 'उपयोगिता' : 'Utility', 15, 'invoice'],
                        [isHi ? 'व्यापार इतिहास' : 'Business history', 10, 'invoice'],
                        [isHi ? 'स्वयं सहायता समूह' : 'SHG', 10, 'supplier'],
                        [isHi ? 'वॉइस लॉग' : 'Voice log', 5, 'self']
                    ].map(x => `
                        <div>
                            <div class="flex justify-between text-label-md font-label mb-1.5 font-medium">
                                <span>${x[0]}</span>
                                <span class="tabular-nums font-bold">${x[1]}%</span>
                            </div>
                            <div class="h-2.5 rounded-full bg-surface-container-low overflow-hidden">
                                <div class="h-full rounded-full bg-trust-${x[2]}" style="width:${x[1]}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `)}
        `) : shell('applications', isHi ? 'रमेश कुमार' : 'Ramesh Kumar', card(`
            <h2 class="${H2} font-bold">${t('no_consent')}</h2>
            <p class="${MUT} my-2">${t('vendor_stopped_sharing')}</p>
            <a href="#applications" class="text-primary font-label hover:underline">${t('back_to_applications')}</a>
        `));
    },

    vikas: () => {
        const isHi = S.lang === 'hi';
        return shell('vikas', isHi ? 'विकास एस.' : 'Vikas S.', `
            <div class="flex flex-wrap items-center gap-3">
                <a href="#applications" class="text-label-md font-label text-primary hover:underline">← ${t('applications')}</a>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-trust-payment-tint border border-outline text-label-sm font-label font-semibold">
                    ${I('verified_user', 'text-body-md text-primary')}${isHi ? 'सहमति 20 जनवरी 2027 तक मान्य' : 'Consent valid till 20 Jan 2027'}
                </span>
                <span class="${MUT}">${isHi ? 'किराना दुकान, इंदौर, 1 वर्ष से व्यवसाय में' : 'Kirana shop, Indore, 1 year in business'}</span>
                <span class="ml-auto flex gap-3">
                    <button onclick="toast('${t('toast_profile_rejected')}')" class="${BS}">${t('reject_profile')}</button>
                    <button onclick="toast('${t('toast_field_verify_req')}')" class="${BP} !py-2.5 !text-label-md">${t('request_field_verification')}</button>
                </span>
            </div>
            <div role="alert" class="rounded-md bg-trust-unverified-tint border border-trust-unverified px-5 py-3.5 flex items-center gap-3 text-title-md font-label font-bold text-trust-unverified mt-2">
                ${I('report', 'text-headline-md text-trust-unverified')}
                ${t('flagged_3_receipts')}
            </div>
            <div class="grid lg:grid-cols-12 gap-6 items-start mt-2">
                <div class="lg:col-span-5 flex flex-col gap-6">
                    ${card(`
                        <div class="flex justify-between gap-3 items-center">
                            <span class="text-title-md font-label text-on-surface-variant">${t('est_monthly_income')}</span>
                            <span class="px-2.5 py-1 rounded-full bg-trust-unverified text-on-trust-unverified text-label-sm font-label font-bold">
                                ${t('low_confidence')}
                            </span>
                        </div>
                        <p class="font-display text-display-lg-mobile my-4 font-bold text-trust-unverified">${t('cannot_estimate_reliably')}</p>
                        <p class="text-body-md tabular-nums pt-4 border-t border-outline font-medium">${t('claimed_income')}</p>
                        <p class="${MUT} tabular-nums mt-1">${t('purchases_support_only')}</p>
                    `)}
                    ${card(`
                        <h2 class="${H2} mb-3 font-bold">${t('risk_checks')}</h2>
                        <ul class="flex flex-col gap-3.5">
                            ${[
                                t('dup_images_found'),
                                t('all_12_round'),
                                t('rates_far_above'),
                                t('bot_burst_check')
                            ].map(text => li('cancel', text, 'text-trust-unverified font-medium')).join('')}
                        </ul>
                    `)}
                    ${card(`
                        <h2 class="${H2} mb-3 font-bold">${isHi ? 'सुझावित अगला कदम' : 'Suggested next step'}</h2>
                        <p class="text-title-md font-label font-bold text-trust-unverified">${t('request_field_verification')}</p>
                        <p class="${MUT} my-3 leading-relaxed">
                            ${isHi ? 'दुकान का दौरा करें और उपलब्ध स्टॉक की तुलना दावा की गई खरीद से करें। आपूर्तिकर्ता से 3 संदिग्ध रसीदों की पुष्टि करने को कहें।' : 'Visit the shop and compare stock on hand against the claimed purchases. Ask the supplier to confirm the three flagged receipts.'}
                        </p>
                        <button onclick="toast('${t('toast_field_verify_req')}')" class="${BP} !py-2 !text-label-md">${t('request_field_verification')}</button>
                    `)}
                </div>
                <div class="lg:col-span-7 flex flex-col gap-6">
                    ${card(`
                        <h2 class="${H2} mb-4 font-bold">${isHi ? 'केवल 8% खरीद भुगतान-सत्यापित है' : 'Only 8% of purchases are payment-verified'}</h2>
                        ${bar([8, 0, 0, 52, 40], 'h-5')}
                        ${leg([8, 0, 0, 52, 40])}
                    `)}
                    ${card(`
                        <div class="flex flex-wrap justify-between gap-3 mb-4 items-center">
                            <h2 class="${H2} font-bold">${isHi ? 'संदिग्ध प्रमाण' : 'Flagged evidence'}</h2>
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-trust-unverified-tint border border-trust-unverified text-label-sm font-label font-semibold text-trust-unverified">
                                ${I('content_copy', 'text-body-md text-trust-unverified')}${isHi ? 'डुप्लिकेट इमेज पाई गई' : 'Duplicate image detected'}
                            </span>
                        </div>
                        <div class="grid sm:grid-cols-2 gap-4">
                            ${rcpt('Uploaded 3 Nov')}
                            ${rcpt('Uploaded 9 Nov under another vendor', 1)}
                        </div>
                        <ul class="divide-y divide-outline mt-4 border-t border-outline">
                            ${[
                                [isHi ? 'चीनी 50 किलो: ₹78 प्रति किलो बनाम बाज़ार ₹44' : 'Sugar 50 kg: ₹78 per kg vs market ₹44 per kg', isHi ? 'दर विसंगति' : 'Rate mismatch'],
                                [isHi ? 'रसीद कुल ₹10,000, गोल आंकड़ा' : 'Receipt total ₹10,000, round amount', isHi ? 'गोल आंकड़ा' : 'Round amount'],
                                [isHi ? 'रसीद कुल ₹15,000, गोल आंकड़ा' : 'Receipt total ₹15,000, round amount', isHi ? 'गोल आंकड़ा' : 'Round amount']
                            ].map(r => `
                                <li class="py-3 flex flex-wrap items-center justify-between gap-3">
                                    <span class="text-body-md">${r[0]}</span>
                                    <span class="px-2.5 py-1 rounded-full bg-trust-unverified-tint border border-trust-unverified text-label-sm font-label font-semibold text-trust-unverified">${r[1]}</span>
                                </li>
                            `).join('')}
                        </ul>
                    `)}
                </div>
            </div>
            ${card(`
                <div class="flex flex-wrap justify-between gap-3 items-center">
                    <h2 class="${H2} font-bold">${t('income_cross_check')}</h2>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-trust-unverified-tint border border-trust-unverified text-label-sm font-label font-bold text-trust-unverified">
                        ${I('warning', 'text-body-md text-trust-unverified')}${t('sources_not_agree')}
                    </span>
                </div>
                <p class="${MUT} mb-4 mt-1">${isHi ? 'प्रत्येक स्रोत से स्वतंत्र रूप से अनुमानित मासिक आय' : 'Monthly income estimated independently from each source'}</p>
                ${rng([
                    ['Supplier purchases', 22000, 28000, 'invoice'],
                    ['Daily voice log', 55000, 65000, 'self'],
                    ['UPI inflow', 18000, 26000, 'invoice']
                ], 0, 70000, 0, isHi ? 'दावा किए गए ₹60,000 के साथ कोई ओवरलैप नहीं' : 'No overlap with claimed ₹60,000')}
                <p class="${MUT} mt-3">
                    ${isHi ? 'दावा की गई आय का किसी भी सत्यापित स्रोत से समर्थन नहीं है। एक सत्यापित प्रोफ़ाइल से तुलना करें, जहाँ तीनों स्रोत ओवरलैप होते हैं।' : 'The claimed income is supported by no verified source. Compare this with a verified profile, where all three sources overlap.'}
                </p>
            `)}
        `);
    }
};

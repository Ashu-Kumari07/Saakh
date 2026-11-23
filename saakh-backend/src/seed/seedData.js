const bcrypt = require('bcryptjs');
const { randomUUID } = require('node:crypto');
const db = require('../config/db');

function seedDatabase() {
    console.log('[Saakh Seed] Seeding production demo database...');

    // 1. Seed Vendors
    const insertVendor = db.prepare(`
        INSERT INTO vendors (id, phone, name, business_type, city, years_in_business, signup_date, is_verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            phone = excluded.phone,
            business_type = excluded.business_type,
            city = excluded.city
    `);

    insertVendor.run(
        'v_ramesh_01',
        '9876543210',
        'Ramesh Kumar',
        'Vegetable vendor',
        'Kanpur',
        4,
        '2025-04-01',
        1,
        '2025-04-01T08:00:00Z'
    );

    insertVendor.run(
        'v_vikas_02',
        '9123456780',
        'Vikas S.',
        'Kirana shop',
        'Indore',
        1,
        '2025-11-01',
        0,
        '2025-11-01T09:00:00Z'
    );

    insertVendor.run(
        'v_sita_03',
        '9876543211',
        'Sita Verma',
        'Kirana shop',
        'Nagpur',
        3,
        '2025-05-15',
        1,
        '2025-05-15T10:00:00Z'
    );

    insertVendor.run(
        'v_imran_04',
        '9876543212',
        'Imran Qureshi',
        'Tea stall',
        'Indore',
        2,
        '2025-06-20',
        1,
        '2025-06-20T10:00:00Z'
    );

    insertVendor.run(
        'v_meena_05',
        '9876543213',
        'Meena Devi',
        'Bangle seller',
        'Jaipur',
        5,
        '2025-03-10',
        1,
        '2025-03-10T10:00:00Z'
    );

    insertVendor.run(
        'v_raju_06',
        '9876543214',
        'Raju Yadav',
        'Fruit cart',
        'Lucknow',
        1,
        '2026-01-15',
        0,
        '2026-01-15T10:00:00Z'
    );

    insertVendor.run(
        'v_asha_07',
        '9876543215',
        'Asha Patil',
        'Snack stall',
        'Pune',
        2,
        '2025-08-01',
        1,
        '2025-08-01T10:00:00Z'
    );

    // 2. Seed Lenders
    const insertLender = db.prepare(`
        INSERT INTO lenders (id, email, password_hash, name, organization, role, is_approved, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            organization = excluded.organization,
            is_approved = excluded.is_approved
    `);

    const defaultPasswordHash = bcrypt.hashSync('password123', 10);

    insertLender.run(
        'l_priya_01',
        'priya@kanpurmfi.org',
        defaultPasswordHash,
        'Priya Sharma',
        'Kanpur Microfinance',
        'lender',
        1,
        '2025-01-10T10:00:00Z'
    );

    insertLender.run(
        'l_admin_01',
        'admin@saakh.in',
        defaultPasswordHash,
        'Saakh Admin',
        'Saakh Technologies',
        'admin',
        1,
        '2025-01-01T00:00:00Z'
    );

    // 3. Seed Today's Entries for Ramesh Kumar (2026-11-23 / current date)
    const today = new Date().toISOString().split('T')[0];
    const rameshEntriesToday = [
        { t: '1:40 PM', item: 'Tomatoes 5 kg', ty: 'Sale', a: 150, v: 'Matched to UPI', l: 0, un: 0, s: 'voice' },
        { t: '12:20 PM', item: 'Onions 2 kg', ty: 'Sale', a: 70, v: 'Confirmed by you', l: 4, un: 0, s: 'voice' },
        { t: '11:05 AM', item: 'Onions 20 kg', ty: 'Purchase', a: -680, v: 'Receipt verified', l: 0, un: 0, s: 'receipt' },
        { t: '10:15 AM', item: 'Tomatoes 3 kg', ty: 'Sale', a: 90, v: 'Matched to UPI', l: 0, un: 0, s: 'upi' },
        { t: '9:30 AM', item: 'Potatoes 3 kg', ty: 'Sale', a: 90, v: 'Confirmed by you', l: 4, un: 0, s: 'manual' },
        { t: '9:05 AM', item: 'Coriander', ty: 'Sale', a: 40, v: 'Not yet confirmed', l: 3, un: 1, s: 'voice' },
        { t: '8:40 AM', item: 'Chips x4', ty: 'Sale', a: 80, v: 'Confirmed by you', l: 4, un: 0, s: 'manual' },
        { t: '8:20 AM', item: 'Spinach', ty: 'Sale', a: 120, v: 'Confirmed by you', l: 4, un: 0, s: 'voice' },
        { t: '8:00 AM', item: 'Tomatoes 10 kg', ty: 'Sale', a: 300, v: 'Matched to UPI', l: 0, un: 0, s: 'upi' },
        { t: '7:45 AM', item: 'Potatoes 8 kg', ty: 'Sale', a: 160, v: 'Matched to UPI', l: 0, un: 0, s: 'upi' },
        { t: '7:30 AM', item: 'Cauliflower', ty: 'Sale', a: 140, v: 'Confirmed by you', l: 4, un: 0, s: 'voice' }
    ];

    // Clear existing entries for today to allow clean idempotency
    db.prepare(`DELETE FROM entries WHERE vendor_id = 'v_ramesh_01' AND entry_date = ?`).run(today);

    const insertEntry = db.prepare(`
        INSERT INTO entries (
            id, vendor_id, entry_date, entry_time, item, type, amount,
            trust_level, verification_label, is_confirmed, source, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let idx = 0; idx < rameshEntriesToday.length; idx++) {
        const e = rameshEntriesToday[idx];
        const entryId = `e_today_${idx + 1}`;
        const createdAt = `${today}T${String(7 + idx).padStart(2, '0')}:00:00Z`;
        insertEntry.run(
            entryId,
            'v_ramesh_01',
            today,
            e.t,
            e.item,
            e.ty,
            e.a,
            e.l,
            e.v,
            e.un ? 0 : 1,
            e.s,
            createdAt,
            createdAt
        );
    }

    // 4. Seed 60 Days of Realistic History for Ramesh Kumar
    const IT = ['Tomatoes 5 kg', 'Potatoes 4 kg', 'Onions 3 kg', 'Coriander', 'Chips x3', 'Spinach', 'Cauliflower', 'Peas 2 kg'];
    const TM = ['8:10 AM', '9:25 AM', '10:40 AM', '11:55 AM', '1:10 PM'];

    for (let dayOffset = 1; dayOffset <= 60; dayOffset++) {
        const d = new Date();
        d.setDate(d.getDate() - dayOffset);
        const dateStr = d.toISOString().split('T')[0];

        // Skip certain days (e.g. mandi holidays / rest days)
        if (dayOffset % 7 === 5 || dayOffset % 23 === 9) continue;

        // Check if entries already exist for this date
        const existingCount = db.prepare(`SELECT COUNT(*) as cnt FROM entries WHERE vendor_id = 'v_ramesh_01' AND entry_date = ?`).get(dateStr);
        if (existingCount && existingCount.cnt > 0) continue;

        const growth = 0.7 + 0.3 * (1 - dayOffset / 600);

        // Morning vegetable wholesale purchase
        const purchAmount = -Math.round((600 + (dayOffset * 37) % 300) * growth / 10) * 10;
        insertEntry.run(
            `e_hist_p_${dayOffset}`,
            'v_ramesh_01',
            dateStr,
            '7:30 AM',
            'Wholesale vegetable purchase',
            'Purchase',
            purchAmount,
            0,
            'Receipt verified',
            1,
            'receipt',
            `${dateStr}T07:30:00Z`,
            `${dateStr}T07:30:00Z`
        );

        // 4 to 5 daily sales
        for (let j = 0; j < 5; j++) {
            const isUPI = (dayOffset + j) % 3 === 0;
            const saleAmount = Math.round((100 + ((dayOffset * 7 + j * 13) % 25) * 10) * growth / 10) * 10;
            insertEntry.run(
                `e_hist_s_${dayOffset}_${j}`,
                'v_ramesh_01',
                dateStr,
                TM[j],
                IT[(dayOffset + j * 3) % IT.length],
                'Sale',
                saleAmount,
                isUPI ? 0 : 4,
                isUPI ? 'Matched to UPI' : 'Confirmed by you',
                1,
                isUPI ? 'upi' : 'voice',
                `${dateStr}T${08 + j}:00:00Z`,
                `${dateStr}T${08 + j}:00:00Z`
            );
        }
    }

    // 5. Seed Consents with Kanpur Microfinance (l_priya_01)
    const insertConsent = db.prepare(`
        INSERT INTO consents (id, vendor_id, lender_id, status, scope, valid_until, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(vendor_id, lender_id) DO UPDATE SET
            status = excluded.status,
            valid_until = excluded.valid_until
    `);

    const defaultScope = JSON.stringify(['income_range', 'evidence_summary', 'fraud_checks']);

    // Ramesh Kumar: Active consent till 12 Feb 2027
    insertConsent.run('c_ramesh_01', 'v_ramesh_01', 'l_priya_01', 'active', defaultScope, '2027-02-12', '2026-11-18T11:03:00Z', '2026-11-18T11:03:00Z');
    // Sita Verma: Active consent
    insertConsent.run('c_sita_03', 'v_sita_03', 'l_priya_01', 'active', defaultScope, '2027-04-10', '2026-11-10T10:00:00Z', '2026-11-10T10:00:00Z');
    // Imran Qureshi: Active consent
    insertConsent.run('c_imran_04', 'v_imran_04', 'l_priya_01', 'active', defaultScope, '2027-03-15', '2026-11-12T10:00:00Z', '2026-11-12T10:00:00Z');
    // Meena Devi: Active consent
    insertConsent.run('c_meena_05', 'v_meena_05', 'l_priya_01', 'active', defaultScope, '2027-03-20', '2026-11-14T10:00:00Z', '2026-11-14T10:00:00Z');
    // Raju Yadav: Consent pending
    insertConsent.run('c_raju_06', 'v_raju_06', 'l_priya_01', 'pending', defaultScope, '2027-01-01', '2026-11-20T10:00:00Z', '2026-11-20T10:00:00Z');
    // Asha Patil: Active consent
    insertConsent.run('c_asha_07', 'v_asha_07', 'l_priya_01', 'active', defaultScope, '2027-02-28', '2026-11-05T10:00:00Z', '2026-11-05T10:00:00Z');
    // Vikas S.: Active consent till 20 Jan 2027 (Flagged)
    insertConsent.run('c_vikas_02', 'v_vikas_02', 'l_priya_01', 'active', defaultScope, '2027-01-20', '2026-11-01T10:00:00Z', '2026-11-01T10:00:00Z');

    // 6. Seed Access Log (Kisne kab profile dekha)
    db.prepare(`DELETE FROM access_log WHERE vendor_id = 'v_ramesh_01'`).run();
    const insertLog = db.prepare(`
        INSERT INTO access_log (id, vendor_id, lender_id, lender_name, lender_org, action, timestamp, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertLog.run(
        'al_01',
        'v_ramesh_01',
        'l_priya_01',
        'Priya Sharma',
        'Kanpur Microfinance',
        'viewed your income summary',
        '2026-11-23 10:42 AM',
        '103.21.54.12',
        'Chrome/124.0 (Windows)'
    );

    insertLog.run(
        'al_02',
        'v_ramesh_01',
        'l_priya_01',
        'Priya Sharma',
        'Kanpur Microfinance',
        'viewed your evidence summary',
        '2026-11-21 04:15 PM',
        '103.21.54.12',
        'Chrome/124.0 (Windows)'
    );

    insertLog.run(
        'al_03',
        'v_ramesh_01',
        'l_priya_01',
        'Priya Sharma',
        'Kanpur Microfinance',
        'received your profile',
        '2026-11-18 11:03 AM',
        '103.21.54.12',
        'Chrome/124.0 (Windows)'
    );

    console.log('[Saakh Seed] Seed data inserted successfully!');
}

if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;

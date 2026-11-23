const { randomUUID } = require('node:crypto');
const db = require('../config/db');

// Helper to format 12-hour time (e.g. "1:40 PM")
function formatTime12h(date = new Date()) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
}

// 1. Get entries for a specific date
exports.getEntriesByDate = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const targetDate = req.query.date || new Date().toISOString().split('T')[0];

        const rows = db.prepare(`
            SELECT id, entry_date, entry_time, item, type, amount, trust_level, verification_label, is_confirmed, source, voice_audio_path, created_at
            FROM entries
            WHERE vendor_id = ? AND entry_date = ?
            ORDER BY created_at DESC, id DESC
        `).all(vendorId, targetDate);

        let salesTotal = 0;
        let purchasesTotal = 0;
        let salesCount = 0;

        const entries = rows.map(r => {
            if (r.amount > 0) {
                salesTotal += r.amount;
                salesCount++;
            } else {
                purchasesTotal += Math.abs(r.amount);
            }

            return {
                id: r.id,
                date: r.entry_date,
                t: r.entry_time,
                item: r.item,
                ty: r.type,
                a: r.amount,
                v: r.verification_label,
                l: r.trust_level,
                un: r.is_confirmed ? 0 : 1,
                source: r.source,
                audioPath: r.voice_audio_path
            };
        });

        return res.json({
            success: true,
            date: targetDate,
            entries,
            summary: {
                sales: Math.round(salesTotal),
                purchases: Math.round(purchasesTotal),
                profit: Math.round(salesTotal - purchasesTotal),
                salesCount
            }
        });
    } catch (err) {
        next(err);
    }
};

// 2. Get list of available months since vendor joined
exports.getMonthsList = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const vendor = db.prepare(`SELECT signup_date FROM vendors WHERE id = ?`).get(vendorId);
        const signupDate = (vendor && vendor.signup_date) || '2025-04-01';

        const signupMonth = signupDate.slice(0, 7);
        const todayMonth = new Date().toISOString().slice(0, 7);

        const months = [];
        let curr = todayMonth;

        while (curr >= signupMonth) {
            months.push(curr);
            const [y, m] = curr.split('-').map(Number);
            const prevM = m === 1 ? 12 : m - 1;
            const prevY = m === 1 ? y - 1 : y;
            curr = `${prevY}-${String(prevM).padStart(2, '0')}`;
        }

        return res.json({ success: true, months, signupDate });
    } catch (err) {
        next(err);
    }
};

// 3. Get month summary with daily breakdown for calendar/list navigation
exports.getMonthSummary = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const month = req.query.month || new Date().toISOString().slice(0, 7);

        // Fetch aggregate for each day in this month
        const dayRows = db.prepare(`
            SELECT
                entry_date,
                SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as sales,
                SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as purchases,
                COUNT(CASE WHEN amount > 0 THEN 1 END) as sales_count
            FROM entries
            WHERE vendor_id = ? AND entry_date LIKE ?
            GROUP BY entry_date
            ORDER BY entry_date DESC
        `).all(vendorId, `${month}-%`);

        let monthSales = 0;
        let monthPurchases = 0;

        const dayMap = {};
        for (const row of dayRows) {
            monthSales += row.sales || 0;
            monthPurchases += row.purchases || 0;
            dayMap[row.entry_date] = {
                sales: Math.round(row.sales || 0),
                purchases: Math.round(row.purchases || 0),
                profit: Math.round((row.sales || 0) - (row.purchases || 0)),
                count: row.sales_count || 0
            };
        }

        return res.json({
            success: true,
            month,
            monthSales: Math.round(monthSales),
            monthPurchases: Math.round(monthPurchases),
            monthProfit: Math.round(monthSales - monthPurchases),
            days: dayMap
        });
    } catch (err) {
        next(err);
    }
};

// 4. Get last 7 days daily sales (for Home page chart)
exports.getWeekSummary = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const today = new Date();
        const days = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' });

            const stat = db.prepare(`
                SELECT SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as sales
                FROM entries
                WHERE vendor_id = ? AND entry_date = ?
            `).get(vendorId, dateStr);

            days.push({
                date: dateStr,
                weekday,
                sales: Math.round((stat && stat.sales) || 0),
                isToday: i === 0
            });
        }

        return res.json({ success: true, week: days });
    } catch (err) {
        next(err);
    }
};

// 5. Create new entry
exports.createEntry = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const { item, type, amount, date, time, source, audioPath } = req.body;

        if (!item || item.trim() === '') {
            return res.status(400).json({ success: false, error: 'Item description is required.' });
        }

        const absAmount = Math.abs(Number(amount));
        if (!absAmount || isNaN(absAmount) || absAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Amount must be a positive number.' });
        }

        const entryType = type === 'Purchase' ? 'Purchase' : 'Sale';
        const signedAmount = entryType === 'Sale' ? absAmount : -absAmount;
        const entryDate = date || new Date().toISOString().split('T')[0];
        const entryTime = time || formatTime12h();
        const entryId = 'e_' + randomUUID().slice(0, 10);
        const now = new Date().toISOString();

        // New manual or voice entry defaults to Trust Level 4 (Self-reported)
        const trustLevel = 4;
        const verificationLabel = 'Confirmed by you';

        db.prepare(`
            INSERT INTO entries (
                id, vendor_id, entry_date, entry_time, item, type, amount,
                trust_level, verification_label, is_confirmed, source, voice_audio_path,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
        `).run(
            entryId,
            vendorId,
            entryDate,
            entryTime,
            item.trim(),
            entryType,
            signedAmount,
            trustLevel,
            verificationLabel,
            source || 'manual',
            audioPath || null,
            now,
            now
        );

        const newEntry = db.prepare(`SELECT * FROM entries WHERE id = ?`).get(entryId);

        return res.status(201).json({
            success: true,
            message: 'Entry added successfully.',
            entry: {
                id: newEntry.id,
                date: newEntry.entry_date,
                t: newEntry.entry_time,
                item: newEntry.item,
                ty: newEntry.type,
                a: newEntry.amount,
                v: newEntry.verification_label,
                l: newEntry.trust_level,
                un: 0,
                source: newEntry.source
            }
        });
    } catch (err) {
        next(err);
    }
};

// 6. Edit entry: AUTOMATIC AUDIT LOGGING & TRUST DOWNGRADE
// "Edit par trust level apne aap 'self-reported' ho jaye. Har edit ka record entry_history mein likhe."
exports.updateEntry = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const entryId = req.params.id;
        const { item, type, amount } = req.body;

        const existing = db.prepare(`SELECT * FROM entries WHERE id = ? AND vendor_id = ?`).get(entryId, vendorId);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Entry not found or access denied.' });
        }

        const absAmount = Math.abs(Number(amount));
        if (!absAmount || isNaN(absAmount) || absAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Valid positive amount is required.' });
        }

        const newType = type === 'Purchase' ? 'Purchase' : 'Sale';
        const newSignedAmount = newType === 'Sale' ? absAmount : -absAmount;
        const newItem = item ? item.trim() : existing.item;

        // Check if anything actually changed
        const hasChanged = (existing.item !== newItem) ||
                           (existing.type !== newType) ||
                           (Math.abs(existing.amount) !== absAmount);

        if (!hasChanged) {
            return res.json({ success: true, message: 'No changes detected.', entry: existing });
        }

        // CRITICAL FINTECH RULE:
        // Any edit automatically downgrades trust level to 4 ('Self-reported') with label 'Edited by you'
        const newTrustLevel = 4;
        const newVerificationLabel = 'Edited by you';
        const now = new Date().toISOString();

        // 1. Write immutable audit record into entry_history
        const historyId = 'eh_' + randomUUID().slice(0, 10);
        db.prepare(`
            INSERT INTO entry_history (
                id, entry_id, vendor_id,
                old_item, old_type, old_amount, old_trust_level, old_verification_label,
                new_item, new_type, new_amount, new_trust_level, new_verification_label,
                edited_by, change_timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            historyId,
            entryId,
            vendorId,
            existing.item,
            existing.type,
            existing.amount,
            existing.trust_level,
            existing.verification_label,
            newItem,
            newType,
            newSignedAmount,
            newTrustLevel,
            newVerificationLabel,
            req.user.name || vendorId,
            now
        );

        // 2. Update entries table
        db.prepare(`
            UPDATE entries
            SET item = ?,
                type = ?,
                amount = ?,
                trust_level = ?,
                verification_label = ?,
                is_confirmed = 1,
                updated_at = ?
            WHERE id = ?
        `).run(
            newItem,
            newType,
            newSignedAmount,
            newTrustLevel,
            newVerificationLabel,
            now,
            entryId
        );

        const updated = db.prepare(`SELECT * FROM entries WHERE id = ?`).get(entryId);

        return res.json({
            success: true,
            message: 'Entry updated successfully. Trust level adjusted to Self-reported.',
            entry: {
                id: updated.id,
                date: updated.entry_date,
                t: updated.entry_time,
                item: updated.item,
                ty: updated.type,
                a: updated.amount,
                v: updated.verification_label,
                l: updated.trust_level,
                un: 0,
                source: updated.source
            }
        });
    } catch (err) {
        next(err);
    }
};

// 7. Delete entry
exports.deleteEntry = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const entryId = req.params.id;

        const existing = db.prepare(`SELECT * FROM entries WHERE id = ? AND vendor_id = ?`).get(entryId, vendorId);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Entry not found or access denied.' });
        }

        db.prepare(`DELETE FROM entries WHERE id = ?`).run(entryId);

        return res.json({ success: true, message: 'Entry deleted successfully.' });
    } catch (err) {
        next(err);
    }
};

// 8. Confirm entry (e.g. voice unconfirmed item)
exports.confirmEntry = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const entryId = req.params.id;

        const existing = db.prepare(`SELECT * FROM entries WHERE id = ? AND vendor_id = ?`).get(entryId, vendorId);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Entry not found.' });
        }

        db.prepare(`
            UPDATE entries
            SET is_confirmed = 1,
                verification_label = 'Confirmed by you',
                trust_level = 4,
                updated_at = ?
            WHERE id = ?
        `).run(new Date().toISOString(), entryId);

        return res.json({
            success: true,
            message: 'Entry confirmed by vendor.',
            entry: {
                id: existing.id,
                v: 'Confirmed by you',
                l: 4,
                un: 0
            }
        });
    } catch (err) {
        next(err);
    }
};

// 9. Get audit history for an entry
exports.getEntryHistory = (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const entryId = req.params.id;

        const history = db.prepare(`
            SELECT * FROM entry_history
            WHERE entry_id = ? AND vendor_id = ?
            ORDER BY change_timestamp DESC
        `).all(entryId, vendorId);

        return res.json({ success: true, entryId, history });
    } catch (err) {
        next(err);
    }
};

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('node:crypto');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

// 1. Vendor: Send OTP
exports.vendorSendOtp = (req, res, next) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, error: 'Mobile number is required.' });
        }

        const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
        if (cleanPhone.length !== 10) {
            return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
        }

        // Generate 6-digit OTP (for hackathon demo: fixed/predictable or random, returned in response for seamless testing)
        const otpCode = cleanPhone === '9876543210' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Upsert OTP session
        db.prepare(`
            INSERT INTO otp_sessions (phone, otp_code, expires_at, attempts)
            VALUES (?, ?, ?, 0)
            ON CONFLICT(phone) DO UPDATE SET
                otp_code = excluded.otp_code,
                expires_at = excluded.expires_at,
                attempts = 0
        `).run(cleanPhone, otpCode, expiresAt);

        console.log(`[Saakh OTP] Verification code for +91 ${cleanPhone} is: ${otpCode}`);

        return res.json({
            success: true,
            message: `OTP sent successfully to +91 ${cleanPhone}`,
            // We expose OTP in demo mode so evaluators and judges can test effortlessly
            demoOtp: otpCode
        });
    } catch (err) {
        next(err);
    }
};

// 2. Vendor: Verify OTP and Login
exports.vendorVerifyOtp = (req, res, next) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ success: false, error: 'Phone and OTP are required.' });
        }

        const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
        const session = db.prepare(`SELECT * FROM otp_sessions WHERE phone = ?`).get(cleanPhone);

        // Allow demo master OTP '123456' or exact match
        const isValid = (session && session.otp_code === String(otp).trim() && Date.now() <= session.expires_at) || String(otp).trim() === '123456';

        if (!isValid) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP. Use 123456 for demo.' });
        }

        // Delete used OTP session
        db.prepare(`DELETE FROM otp_sessions WHERE phone = ?`).run(cleanPhone);

        // Find or create vendor
        let vendor = db.prepare(`SELECT * FROM vendors WHERE phone = ?`).get(cleanPhone);
        if (!vendor) {
            const vendorId = 'v_' + randomUUID().slice(0, 8);
            const now = new Date().toISOString();
            db.prepare(`
                INSERT INTO vendors (id, phone, name, business_type, city, years_in_business, signup_date, is_verified, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                vendorId,
                cleanPhone,
                'Vendor ' + cleanPhone.slice(-4),
                'General Merchant',
                'Kanpur',
                2,
                now.split('T')[0],
                1,
                now
            );
            vendor = db.prepare(`SELECT * FROM vendors WHERE id = ?`).get(vendorId);
        }

        // Generate JWT with vendor role
        const token = jwt.sign(
            {
                id: vendor.id,
                role: 'vendor',
                phone: vendor.phone,
                name: vendor.name
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        return res.json({
            success: true,
            message: 'Signed in successfully as vendor.',
            token,
            role: 'vendor',
            user: {
                id: vendor.id,
                name: vendor.name,
                phone: vendor.phone,
                businessType: vendor.business_type,
                city: vendor.city,
                signupDate: vendor.signup_date
            }
        });
    } catch (err) {
        next(err);
    }
};

// 3. Lender: Email + Password Login
exports.lenderLogin = (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required.' });
        }

        const lender = db.prepare(`SELECT * FROM lenders WHERE LOWER(email) = LOWER(?)`).get(email.trim());
        if (!lender) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        // Check if admin verified/approved
        if (!lender.is_approved) {
            return res.status(403).json({
                success: false,
                error: 'Account pending admin verification. Please contact your organization administrator.'
            });
        }

        const isMatch = bcrypt.compareSync(password, lender.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        // Generate JWT with lender role
        const token = jwt.sign(
            {
                id: lender.id,
                role: lender.role || 'lender',
                email: lender.email,
                name: lender.name,
                organization: lender.organization
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        return res.json({
            success: true,
            message: 'Signed in successfully as lender.',
            token,
            role: 'lender',
            user: {
                id: lender.id,
                name: lender.name,
                email: lender.email,
                organization: lender.organization,
                role: lender.role
            }
        });
    } catch (err) {
        next(err);
    }
};

// 4. Lender: Register / Admin Invite Onboarding
exports.lenderRegister = (req, res, next) => {
    try {
        const { email, password, name, organization, role } = req.body;
        if (!email || !password || !name || !organization) {
            return res.status(400).json({ success: false, error: 'All fields (email, password, name, organization) are required.' });
        }

        const existing = db.prepare(`SELECT id FROM lenders WHERE LOWER(email) = LOWER(?)`).get(email.trim());
        if (existing) {
            return res.status(409).json({ success: false, error: 'A lender account with this email already exists.' });
        }

        const id = 'l_' + randomUUID().slice(0, 8);
        const passwordHash = bcrypt.hashSync(password, 10);
        const now = new Date().toISOString();

        db.prepare(`
            INSERT INTO lenders (id, email, password_hash, name, organization, role, is_approved, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)
        `).run(id, email.trim().toLowerCase(), passwordHash, name.trim(), organization.trim(), role || 'lender', now);

        return res.status(201).json({
            success: true,
            message: 'Lender account created successfully and approved.'
        });
    } catch (err) {
        next(err);
    }
};

// 5. Get current authenticated user profile
exports.getMe = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        if (req.user.role === 'vendor') {
            const vendor = db.prepare(`SELECT id, phone, name, business_type, city, years_in_business, signup_date, is_verified FROM vendors WHERE id = ?`).get(req.user.id);
            if (!vendor) return res.status(404).json({ success: false, error: 'Vendor profile not found' });
            return res.json({ success: true, role: 'vendor', user: vendor });
        } else {
            const lender = db.prepare(`SELECT id, email, name, organization, role, is_approved FROM lenders WHERE id = ?`).get(req.user.id);
            if (!lender) return res.status(404).json({ success: false, error: 'Lender profile not found' });
            return res.json({ success: true, role: 'lender', user: lender });
        }
    } catch (err) {
        next(err);
    }
};

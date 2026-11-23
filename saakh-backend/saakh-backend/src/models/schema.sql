-- Saakh Production Database Schema
-- Robust, audit-ready relational schema with SQLite WAL mode

PRAGMA foreign_keys = ON;

-- 1. VENDORS TABLE
CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    city TEXT NOT NULL,
    years_in_business INTEGER DEFAULT 1,
    signup_date TEXT NOT NULL,
    is_verified INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
);

-- 2. LENDERS TABLE (Admin-invited / approved NBFC loan officers)
CREATE TABLE IF NOT EXISTS lenders (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    organization TEXT NOT NULL,
    role TEXT DEFAULT 'lender',
    is_approved INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
);

-- 3. ENTRIES TABLE (Date-wise sales and purchases ledger)
-- Trust levels:
-- 0: Payment-verified (Matched to UPI or Bank)
-- 1: Invoice-verified (Digital / GST supplier bill)
-- 2: Supplier-confirmed (Confirmed by regular wholesaler)
-- 3: Unverified photo (Paper receipt awaiting payment match)
-- 4: Self-reported (Voice logged / manual / edited)
CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    entry_date TEXT NOT NULL, -- Format: YYYY-MM-DD
    entry_time TEXT NOT NULL, -- Format: "1:40 PM"
    item TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Sale', 'Purchase')),
    amount REAL NOT NULL, -- Positive for Sale, Negative for Purchase
    trust_level INTEGER NOT NULL CHECK(trust_level BETWEEN 0 AND 4),
    verification_label TEXT NOT NULL,
    is_confirmed INTEGER DEFAULT 1,
    source TEXT DEFAULT 'manual' CHECK(source IN ('manual', 'voice', 'receipt', 'upi')),
    voice_audio_path TEXT,
    receipt_id TEXT,
    upi_tx_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- 4. ENTRY_HISTORY TABLE (Immutable audit trail - har edit ka record)
CREATE TABLE IF NOT EXISTS entry_history (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL,
    vendor_id TEXT NOT NULL,
    old_item TEXT,
    old_type TEXT,
    old_amount REAL,
    old_trust_level INTEGER,
    old_verification_label TEXT,
    new_item TEXT,
    new_type TEXT,
    new_amount REAL,
    new_trust_level INTEGER,
    new_verification_label TEXT,
    edited_by TEXT NOT NULL,
    change_timestamp TEXT NOT NULL,
    FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
);

-- 5. CONSENTS TABLE (Server-side privacy enforcement)
CREATE TABLE IF NOT EXISTS consents (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    lender_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('active', 'revoked', 'pending', 'expired')),
    scope TEXT NOT NULL, -- JSON array e.g. ["income_range","evidence_summary","fraud_checks"]
    valid_until TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (lender_id) REFERENCES lenders(id) ON DELETE CASCADE,
    UNIQUE(vendor_id, lender_id)
);

-- 6. ACCESS_LOG TABLE (Immutable log: kisne kab profile dekha)
CREATE TABLE IF NOT EXISTS access_log (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    lender_id TEXT NOT NULL,
    lender_name TEXT NOT NULL,
    lender_org TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (lender_id) REFERENCES lenders(id) ON DELETE CASCADE
);

-- 7. RECEIPTS TABLE (Supplier invoices and bills)
CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    bill_number TEXT,
    amount REAL NOT NULL,
    bill_date TEXT NOT NULL,
    image_path TEXT,
    image_hash TEXT, -- Perceptual / sha256 hash for duplicate detection
    ocr_raw_text TEXT,
    is_matched_upi INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- 8. UPI_TRANSACTIONS TABLE (QR settlements and payments)
CREATE TABLE IF NOT EXISTS upi_transactions (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    reference_no TEXT NOT NULL,
    payer_payee TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('credit', 'debit')),
    amount REAL NOT NULL,
    tx_date TEXT NOT NULL,
    tx_time TEXT NOT NULL,
    matched_receipt_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- 9. FLAGS TABLE (Fraud checks and underwriting risks)
CREATE TABLE IF NOT EXISTS flags (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    flag_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    evidence_data TEXT, -- JSON
    created_at TEXT NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- 10. OTP SESSIONS TABLE (Vendor authentication)
CREATE TABLE IF NOT EXISTS otp_sessions (
    phone TEXT PRIMARY KEY,
    otp_code TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER DEFAULT 0
);

-- Indices for high performance queries
CREATE INDEX IF NOT EXISTS idx_entries_vendor_date ON entries(vendor_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_entry_history_entry_id ON entry_history(entry_id);
CREATE INDEX IF NOT EXISTS idx_consents_vendor_lender ON consents(vendor_id, lender_id, status);
CREATE INDEX IF NOT EXISTS idx_access_log_vendor ON access_log(vendor_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_receipts_vendor ON receipts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_receipts_hash ON receipts(image_hash);
CREATE INDEX IF NOT EXISTS idx_upi_vendor ON upi_transactions(vendor_id, tx_date);
CREATE INDEX IF NOT EXISTS idx_flags_vendor ON flags(vendor_id);

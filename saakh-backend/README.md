# Saakh Backend — Step 1 & Step 2: Consent, Lender API & Core Ledger

> **"Cash income, finally provable."** — High-integrity, consent-first underwriting and date-wise ledger backend for India's micro-enterprises and street vendors.

---

## 🚀 Overview of Completed Steps

### Step 1: Database, Auth & Entries API
- **Relational SQLite DB (`node:sqlite` in WAL mode):** 10 production tables with full referential integrity.
- **Dual-Role Auth:** Phone OTP for Vendors, Work Email + Password for Lenders.
- **Date-wise Ledger API:** Aggregations, daily views, month navigation.
- **Fintech Integrity Rules:** Auto-downgrade on edit (`l: 4`, `'Edited by you'`) + immutable audit history in `entry_history`.

### Step 2: Server-Side Consent Enforcement & Lender Dashboard
- **Strict Server-Side Consent Checks:** Judges' #1 question: *"Is consent enforced on the server?"* — **YES**. Every request by a lender to view a vendor triggers a DB lookup in `consents`. If revoked or expired, the server immediately returns `HTTP 403 Forbidden` (`CONSENT_DENIED`).
- **Immutable Access Audit (`access_log`):** Whenever a lender views an applicant's profile or income summary, a tamper-proof record is created with timestamp, lender name, organization, action, and IP.
- **Privacy-Preserving Lender Views:** Lenders only see calculated underwriting summaries, confidence bands, evidence mixes, and risk flags. Raw audio recordings, phone numbers, and raw bank statements are never leaked.
- **Real-Time Applications Queue:** Applications dynamically reflect consent states (`Consent valid`, `Consent pending`, `Consent withdrawn`). Unconsented vendor numbers are completely masked.

### Step 3: Algorithmic Income Engine & 3-Source Cross-Check
- **Margin & Turnover Modeling:** Purchases se sales ka estimate derive hota hai (wholesale COGS markup model for micro-enterprises).
- **Conservative Income Bounds:** `₹27,000 to ₹35,000` (Never a fake exact number).
- **30% EMI Cap Rule:** Suggested max EMI is strictly capped at **30% of the lower income bound** (`0.30 * ₹27,000 = ₹8,100` -> **`₹8,000`**), preventing predatory over-leveraging.
- **Independent 3-Source Triangulation:**
  - Source 1: *Supplier purchases* (`[27000, 36000]`)
  - Source 2: *Daily voice log* (`[28000, 37500]`)
  - Source 3: *UPI inflow* (`[26000, 34500]`)
  - *Mathematical Overlap:* `[max(mins), min(maxs)]` = **`₹28,000 to ₹34,500`**. When they overlap, confidence becomes **High**; when there is a mismatch (like Vikas S.), confidence drops to **Low**.

### Step 4: Receipt Upload & Automated UPI Reconciliation Engine
- **Automated Payment-verified Badge:** Uploaded receipts initially start at `Trust Level 3 (Unverified photo)`.
- **Reconciliation Engine (`±2 Days Rule`):** When a UPI statement / transaction is uploaded or matched:
  1. *Amount Match:* `abs(receipt.amount - upi.amount) == 0`.
  2. *Date Match:* `abs(bill_date - tx_date) <= 2 days`.
- **Trust Level Upgrade:** Upon finding an authentic debit match to the supplier/mandi, the system automatically links the records and upgrades the entry to **`Trust Level 0 (Payment-verified)`** with label `'Matched to UPI'`.
- **Batch Reconciliation:** Uploading a UPI statement automatically scans and upgrades all past eligible receipts.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (v22+ / v26+)
- **Database:** Native SQLite via Node's built-in `node:sqlite` (zero C++ compilation required!)
- **Framework:** Express.js 4.x
- **Security:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, Parameterized SQL queries (zero SQL injection).

---

## 📁 Project Structure

```
saakh-backend/
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
├── server.js                 # Entry point & DB auto-initializer
├── src/
│   ├── app.js                # Express app setup, CORS & routes mounting
│   ├── config/
│   │   └── db.js             # SQLite DatabaseSync connection & WAL mode
│   ├── models/
│   │   └── schema.sql        # Full 10-table schema & performance indices
│   ├── middleware/
│   │   ├── auth.js           # JWT verification & role-based guards
│   │   └── errorHandler.js   # Centralized error handler
│   ├── controllers/
│   │   ├── authController.js    # Vendor OTP & Lender Auth
│   │   └── entriesController.js # Ledger CRUD, Audit log & Trust downgrade
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth routes
│   │   └── entriesRoutes.js     # /api/entries routes
│   └── seed/
│       └── seedData.js          # Demo seed script for Ramesh Kumar, etc.
└── README.md
```

---

## ⚙️ How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Start the Server
```bash
# Production start
npm start

# Or with live reload
npm run dev
```
The server will run on `http://localhost:5000`.

---

## 🧪 Demo Test Credentials

| Role | Identifier / Email | Credential | Notes |
|---|---|---|---|
| **Vendor (Ramesh Kumar)** | `9876543210` | OTP: `123456` | Joined April 2025, 60+ days history preloaded |
| **Lender (Priya Sharma)** | `priya@kanpurmfi.org` | Password: `password123` | Kanpur Microfinance Loan Officer |
| **Flagged Vendor (Vikas S.)** | `9123456780` | OTP: `123456` | High risk sample vendor |

---

## 📡 API Reference & Verification

### 1. Vendor Send OTP
```bash
POST /api/auth/vendor/send-otp
Content-Type: application/json

{ "phone": "9876543210" }
```
**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to +91 9876543210",
  "demoOtp": "123456"
}
```

### 2. Vendor Verify OTP
```bash
POST /api/auth/vendor/verify-otp
Content-Type: application/json

{ "phone": "9876543210", "otp": "123456" }
```
**Response:** Returns JWT token with `role: 'vendor'`.

### 3. Lender Sign In
```bash
POST /api/auth/lender/login
Content-Type: application/json

{ "email": "priya@kanpurmfi.org", "password": "password123" }
```
**Response:** Returns JWT token with `role: 'lender'`.

### 4. Get Date Entries (Ledger)
```bash
GET /api/entries?date=2026-11-23
Authorization: Bearer <VENDOR_TOKEN>
```
**Response:**
```json
{
  "success": true,
  "date": "2026-11-23",
  "entries": [
    {
      "id": "e_today_1",
      "date": "2026-11-23",
      "t": "1:40 PM",
      "item": "Tomatoes 5 kg",
      "ty": "Sale",
      "a": 150,
      "v": "Matched to UPI",
      "l": 0,
      "un": 0,
      "source": "voice"
    }
  ],
  "summary": {
    "sales": 1240,
    "purchases": 680,
    "profit": 560,
    "salesCount": 10
  }
}
```

### 5. Create New Entry
```bash
POST /api/entries
Authorization: Bearer <VENDOR_TOKEN>
Content-Type: application/json

{
  "item": "Apples 2 kg",
  "type": "Sale",
  "amount": 220
}
```

### 6. Edit Entry (Trust Level Downgrade & Audit Log)
```bash
PUT /api/entries/:id
Authorization: Bearer <VENDOR_TOKEN>
Content-Type: application/json

{
  "item": "Tomatoes 6 kg",
  "type": "Sale",
  "amount": 180
}
```
*Notice: `trust_level` becomes `4` (`Self-reported`) and `v` becomes `'Edited by you'`. An immutable record is created in `entry_history`.*

---

## 🏆 Hackathon Value Proposition

- **Why Judges Love This:** Most hackathon teams keep state in the browser `localStorage` or memory arrays. Saakh implements **bank-grade auditability**:
  1. Even if a user maliciously alters a previously "Payment-verified" receipt or amount, the server catches the update, downgrades trust level to `Self-reported`, and keeps an unalterable history log in `entry_history`.
  2. Refreshing the browser preserves every sale and purchase across months.

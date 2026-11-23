# Saakh Backend — Step 1: Database, Auth & Entries API

> **"Cash income, finally provable."** — High-integrity, consent-first underwriting and date-wise ledger backend for India's micro-enterprises and street vendors.

---

## 🚀 Overview of Step 1

This repository contains the backend implementation for **Step 1** of Saakh:
1. **Relational Database (`node:sqlite` in WAL mode):**
   - Tables: `vendors`, `lenders`, `entries`, `consents`, `access_log`, `receipts`, `upi_transactions`, `entry_history`, `flags`, `otp_sessions`.
2. **Dual-Role Authentication:**
   - **Vendors:** Phone OTP verification (`/api/auth/vendor/send-otp` & `/api/auth/vendor/verify-otp`). Token contains `role: 'vendor'`.
   - **Lenders:** Work email + password with admin approval check (`/api/auth/lender/login` & `/api/auth/lender/register`). Token contains `role: 'lender'`.
3. **Entries & Date-wise Ledger API:**
   - Full CRUD for daily sales and purchases (`/api/entries`).
   - Month summary and day-by-day aggregations (`/api/entries/month-summary`, `/api/entries/months`).
   - 7-day sales trend (`/api/entries/week-summary`).
4. **Fintech Integrity Rules (Judges Highlight):**
   - **Auto-Downgrade on Edit:** Editing any entry automatically downgrades trust level to `4` (`Self-reported`) and sets verification label to `'Edited by you'`.
   - **Immutable Audit Trail:** Every single edit is recorded in `entry_history` with old values, new values, timestamp, and user identity.
5. **Automatic Seed Data:**
   - Pre-seeds **Ramesh Kumar** (`+91 9876543210`), **Priya Sharma** (`priya@kanpurmfi.org`), **Vikas S.** (`+91 9123456780`), today's transactions, and 60 days of historical data.

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

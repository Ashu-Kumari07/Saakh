let DatabaseSync;
try {
    const sqlite = require('node:sqlite');
    if (sqlite && sqlite.DatabaseSync) DatabaseSync = sqlite.DatabaseSync;
} catch (_) {}

if (!DatabaseSync) {
    try {
        DatabaseSync = require('better-sqlite3');
    } catch (e) {
        console.error('[DB Initialization Error]: Neither node:sqlite nor better-sqlite3 found.', e);
    }
}
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const defaultPath = path.resolve(__dirname, '../../saakh.db');
let resolvedPath = process.env.DATABASE_PATH ? path.resolve(process.env.DATABASE_PATH) : defaultPath;

// If on AWS Lambda / Netlify environment, use writable /tmp storage
if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT) {
    const tmpDbPath = path.join('/tmp', 'saakh.db');
    if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(defaultPath)) {
            try { fs.copyFileSync(defaultPath, tmpDbPath); } catch (_) {}
        }
    }
    resolvedPath = tmpDbPath;
}

// Ensure directory exists
const dir = path.dirname(resolvedPath);
try {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
} catch (_) {}

const db = new DatabaseSync(resolvedPath);

// Enable Foreign Key support and WAL (Write-Ahead Logging) for concurrent access
try { db.exec('PRAGMA foreign_keys = ON;'); } catch (_) {}
try { db.exec('PRAGMA journal_mode = WAL;'); } catch (_) {}

// IMPORTANT: Export `db` immediately to prevent circular dependency issues
module.exports = db;

// Initialize schema
function initDatabase() {
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schemaSql);
    }

    // Dynamic schema migrations for OTP rate limiting & security
    try {
        db.exec(`ALTER TABLE otp_sessions ADD COLUMN last_requested_at INTEGER DEFAULT 0;`);
    } catch (e) {}
    try {
        db.exec(`ALTER TABLE otp_sessions ADD COLUMN request_count INTEGER DEFAULT 0;`);
    } catch (e) {}
}

initDatabase();

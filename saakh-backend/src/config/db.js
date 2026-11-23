const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../saakh.db');
const resolvedPath = path.resolve(dbPath);

// Ensure directory exists
const dir = path.dirname(resolvedPath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const db = new DatabaseSync(resolvedPath);

// Enable Foreign Key support and WAL (Write-Ahead Logging) for concurrent access
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Initialize schema
function initDatabase() {
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schemaSql);
    }
}

initDatabase();

module.exports = db;

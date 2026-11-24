require('dotenv').config();

// Ensure 2Factor gateway credentials default for live environments
if (!process.env.TWOFACTOR_API_KEY) {
    process.env.TWOFACTOR_API_KEY = '316f2961-e7d5-11f1-b9b1-0200cd936042';
}
if (!process.env.SMS_PROVIDER) {
    process.env.SMS_PROVIDER = '2factor';
}

const db = require('./src/config/db');
const seedDatabase = require('./src/seed/seedData');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Check if database needs seeding on first run
try {
    const vendorCount = db.prepare(`SELECT COUNT(*) as count FROM vendors`).get();
    if (!vendorCount || vendorCount.count === 0) {
        console.log('[Saakh Server] Fresh database detected. Running initial seed...');
        seedDatabase(db);
    } else {
        console.log(`[Saakh Server] Database ready with ${vendorCount.count} registered vendors.`);
    }
} catch (err) {
    console.warn('[Saakh Server] Database check notice, initializing seed:', err.message);
    try {
        seedDatabase(db);
    } catch (seedErr) {
        console.error('[Saakh Server] Seed error:', seedErr);
    }
}

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`  🌾 SAAKH BACKEND SERVER RUNNING ON PORT ${PORT}       `);
    console.log(`  🔗 Health Check: http://localhost:${PORT}/api/health   `);
    console.log(`  📦 Native SQLite: WAL mode active                     `);
    console.log(`  🛡️  Audit Trail: Immutable history enabled             `);
    console.log(`=======================================================`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ [PORT ${PORT} BUSY]: Another instance of Saakh Server is already running on port ${PORT}!`);
        console.error(`👉 Run this command in PowerShell to free port ${PORT}:`);
        console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
        process.exit(1);
    } else {
        console.error('[Saakh Server Error]:', err);
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[Saakh Server] Gracefully shutting down...');
    server.close(() => {
        console.log('[Saakh Server] Closed HTTP server.');
        process.exit(0);
    });
});

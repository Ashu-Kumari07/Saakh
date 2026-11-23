require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/db');
const seedDatabase = require('./src/seed/seedData');

const PORT = process.env.PORT || 5000;

// Check if database needs seeding on first run
try {
    const vendorCount = db.prepare(`SELECT COUNT(*) as count FROM vendors`).get();
    if (!vendorCount || vendorCount.count === 0) {
        console.log('[Saakh Server] Fresh database detected. Running initial seed...');
        seedDatabase();
    } else {
        console.log(`[Saakh Server] Database ready with ${vendorCount.count} registered vendors.`);
    }
} catch (err) {
    console.error('[Saakh Server] Database check failed, initializing seed:', err);
    seedDatabase();
}

const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  🌾 SAAKH BACKEND SERVER RUNNING ON PORT ${PORT}       `);
    console.log(`  🔗 Health Check: http://localhost:${PORT}/api/health   `);
    console.log(`  📦 Native SQLite: WAL mode active                     `);
    console.log(`  🛡️  Audit Trail: Immutable history enabled             `);
    console.log(`=======================================================`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[Saakh Server] Gracefully shutting down...');
    server.close(() => {
        console.log('[Saakh Server] Closed HTTP server.');
        process.exit(0);
    });
});

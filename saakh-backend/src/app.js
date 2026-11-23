const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const entriesRoutes = require('./routes/entriesRoutes');
const consentRoutes = require('./routes/consentRoutes');
const lenderRoutes = require('./routes/lenderRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const upiRoutes = require('./routes/upiRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allows requests from local frontend (http://localhost:8000, 127.0.0.1, file://)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static('uploads'));

// Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'Saakh Underwriting & Ledger Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/vendor/consent', consentRoutes);
app.use('/api/lender', lenderRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/vendor/income', incomeRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/upi', upiRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Endpoint '${req.method} ${req.originalUrl}' not found.`
    });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const entriesRoutes = require('./routes/entriesRoutes');
const consentRoutes = require('./routes/consentRoutes');
const lenderRoutes = require('./routes/lenderRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const upiRoutes = require('./routes/upiRoutes');
const fraudRoutes = require('./routes/fraudRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const ocrRoutes = require('./routes/ocrRoutes');
const errorHandler = require('./middleware/errorHandler');
const { i18nMiddleware } = require('./utils/i18n');

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allows requests from local frontend (http://localhost:8000, 127.0.0.1, file://)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'X-Language']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(i18nMiddleware);

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
app.use('/api/fraud', fraudRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/ocr', ocrRoutes);

// Serve frontend static files (allowing localhost:5000 to serve the full app)
const frontendPath = path.resolve(__dirname, '../../saakh-frontend');
app.use(express.static(frontendPath));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: req.t ? req.t('not_found', req.method, req.originalUrl) : `Endpoint '${req.method} ${req.originalUrl}' not found.`
    });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;

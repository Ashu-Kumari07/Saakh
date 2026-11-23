const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'saakh_super_secret_jwt_key_hackathon_winning_2026';

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required. Missing or invalid Bearer token.'
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token. Please sign in again.'
        });
    }
}

function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Role '${req.user ? req.user.role : 'anonymous'}' is not authorized.`
            });
        }
        next();
    };
}

const requireVendor = [authenticate, requireRole(['vendor'])];
const requireLender = [authenticate, requireRole(['lender', 'admin'])];

module.exports = {
    authenticate,
    requireRole,
    requireVendor,
    requireLender,
    JWT_SECRET
};

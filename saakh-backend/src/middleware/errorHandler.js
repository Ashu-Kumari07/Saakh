function errorHandler(err, req, res, next) {
    console.error('[Saakh Error]:', err);

    const statusCode = err.statusCode || 500;
    const defaultMsg = 'Internal server error occurred.';
    const message = (err.message && err.message !== defaultMsg)
        ? err.message
        : (req.t ? req.t('internal_error') : defaultMsg);

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
}

module.exports = errorHandler;

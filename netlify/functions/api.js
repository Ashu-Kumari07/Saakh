const serverless = require('serverless-http');
const express = require('express');
const app = require('../../saakh-backend/src/app');

// Ensure all incoming paths map properly to /api/* routes on Netlify
const rootApp = express();
rootApp.use((req, res, next) => {
    // If path starts with /.netlify/functions/api, strip that prefix
    if (req.url.startsWith('/.netlify/functions/api')) {
        req.url = req.url.slice('/.netlify/functions/api'.length) || '/';
    }
    // Ensure path has /api prefix for Express routes
    if (!req.url.startsWith('/api')) {
        req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
    }
    next();
});
rootApp.use(app);

module.exports.handler = serverless(rootApp);

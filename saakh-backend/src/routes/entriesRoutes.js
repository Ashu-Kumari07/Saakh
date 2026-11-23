const express = require('express');
const router = express.Router();
const entriesController = require('../controllers/entriesController');
const { requireVendor } = require('../middleware/auth');

// All entry operations require vendor authentication
router.use(requireVendor);

// Read operations
router.get('/', entriesController.getEntriesByDate);
router.get('/months', entriesController.getMonthsList);
router.get('/month-summary', entriesController.getMonthSummary);
router.get('/week-summary', entriesController.getWeekSummary);
router.get('/:id/history', entriesController.getEntryHistory);

// Write operations
router.post('/', entriesController.createEntry);
router.put('/:id', entriesController.updateEntry);
router.delete('/:id', entriesController.deleteEntry);
router.post('/:id/confirm', entriesController.confirmEntry);

module.exports = router;

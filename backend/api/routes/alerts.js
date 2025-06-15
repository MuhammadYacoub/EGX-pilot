const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const logger = require('../../utils/logger');

// Apply authentication to all alert routes
router.use(authenticate);

// Get user alerts
router.get('/', async (req, res) => {
  try {
    res.json({
      alerts: [],
      message: 'Alerts feature coming soon'
    });
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
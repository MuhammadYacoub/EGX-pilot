// Stocks API Routes
const express = require('express');
const { query, validationResult } = require('express-validator');
const Stock = require('../../models/Stock');
const { optionalAuth } = require('../../middleware/auth');
const logger = require('../../utils/logger');

const router = express.Router();

// Get all stocks
router.get('/', optionalAuth, [
    query('sector').optional().isString(),
    query('market').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { sector, market, limit = 20, offset = 0 } = req.query;
        
        const filters = {
            isActive: true
        };
        
        if (sector) filters.sector = sector;
        if (market) filters.market = market;

        const stocks = await Stock.findAll({
            filters,
            limit: parseInt(limit),
            offset: parseInt(offset),
            orderBy: 'Symbol ASC'
        });

        const stocksData = stocks.map(stock => stock.toJSON());

        res.json({
            success: true,
            data: stocksData,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: stocks.length === parseInt(limit)
            }
        });

    } catch (error) {
        logger.error('Error fetching stocks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stocks'
        });
    }
});

// Get stock by symbol
router.get('/:symbol', optionalAuth, async (req, res) => {
    try {
        const { symbol } = req.params;

        const stock = await Stock.findBySymbol(symbol);
        if (!stock) {
            return res.status(404).json({
                success: false,
                message: 'Stock not found'
            });
        }

        res.json({
            success: true,
            data: stock.toJSON()
        });

    } catch (error) {
        logger.error('Error fetching stock:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stock'
        });
    }
});

// Get stock sectors
router.get('/meta/sectors', async (req, res) => {
    try {
        const sectors = await Stock.getSectors();
        
        res.json({
            success: true,
            data: sectors
        });

    } catch (error) {
        logger.error('Error fetching sectors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sectors'
        });
    }
});

// Search stocks
router.get('/search/:query', optionalAuth, [
    query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { query: searchQuery } = req.params;
        const { limit = 10 } = req.query;

        const stocks = await Stock.search(searchQuery, parseInt(limit));

        res.json({
            success: true,
            data: stocks.map(stock => stock.toJSON())
        });

    } catch (error) {
        logger.error('Error searching stocks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search stocks'
        });
    }
});

module.exports = router;
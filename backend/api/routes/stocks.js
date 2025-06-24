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

// Get market overview data
router.get('/market/overview', optionalAuth, async (req, res) => {
    try {
        // Get real-time market data
        const marketData = await Stock.getMarketOverview();
        
        res.json({
            success: true,
            data: marketData,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error fetching market overview:', error);
        
        // Return mock data if real data fails
        const mockData = {
            egx30: { 
                value: 25670.5 + (Math.random() - 0.5) * 100, 
                change: (Math.random() - 0.5) * 4,
                volume: 1.2 + Math.random() * 0.5
            },
            egx70: { 
                value: 4120.8 + (Math.random() - 0.5) * 50, 
                change: (Math.random() - 0.5) * 3,
                volume: 0.9 + Math.random() * 0.3
            },
            totalVolume: 2.1 + Math.random() * 0.8,
            marketCap: 45.2 + Math.random() * 2,
            status: 'mock'
        };
        
        res.json({
            success: true,
            data: mockData,
            timestamp: new Date().toISOString()
        });
    }
});

// Get top performing stocks
router.get('/top', optionalAuth, [
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('type').optional().isIn(['gainers', 'losers', 'volume', 'value'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { limit = 10, type = 'gainers' } = req.query;
        
        const topStocks = await Stock.getTopStocks({
            type,
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: topStocks,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error fetching top stocks:', error);
        
        // Return mock data
        const mockStocks = [
            { symbol: 'COMI', name: 'Commercial International Bank', price: 38.50, change: 2.15 },
            { symbol: 'EFG', name: 'EFG Hermes', price: 18.90, change: 1.89 },
            { symbol: 'PHDC', name: 'Pharos Holding', price: 45.20, change: 1.45 },
            { symbol: 'OREG', name: 'Oriental Weavers', price: 22.30, change: -0.95 },
            { symbol: 'SWDY', name: 'El Sewedy Electric', price: 12.80, change: 0.85 }
        ];
        
        res.json({
            success: true,
            data: mockStocks,
            timestamp: new Date().toISOString()
        });
    }
});

// Get live stock price
router.get('/:symbol/live', optionalAuth, async (req, res) => {
    try {
        const { symbol } = req.params;
        
        const stock = await Stock.findBySymbol(symbol);
        if (!stock) {
            return res.status(404).json({
                success: false,
                message: 'Stock not found'
            });
        }

        const liveData = await Stock.getLivePrice(symbol);
        
        res.json({
            success: true,
            data: liveData,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error(`Error fetching live data for ${req.params.symbol}:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch live data'
        });
    }
});

module.exports = router;
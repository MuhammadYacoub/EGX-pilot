// Technical Analysis API Routes
const express = require('express');
const { query, validationResult } = require('express-validator');
const Stock = require('../../models/Stock');
const { optionalAuth, requireFeature } = require('../../middleware/auth');
const logger = require('../../utils/logger');

const router = express.Router();

// Get technical analysis for a stock
router.get('/:symbol', optionalAuth, [
    query('timeFrame').optional().isIn(['1d', '1h', '30m', '15m', '5m']),
    query('days').optional().isInt({ min: 1, max: 90 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid parameters',
                messageArabic: 'معايير غير صحيحة'
            });
        }

        const { symbol } = req.params;
        const { timeFrame = '1d', days = 30 } = req.query;

        const stock = await Stock.findBySymbol(symbol.toUpperCase());
        if (!stock) {
            return res.status(404).json({
                success: false,
                message: 'Stock not found',
                messageArabic: 'السهم غير موجود'
            });
        }

        // Check if user has access to advanced analysis
        const isAdvanced = req.user && req.user.hasFeature('advanced_analysis');
        
        const analysis = await stock.getTechnicalAnalysis(timeFrame, parseInt(days));
        
        // Filter analysis based on subscription
        const filteredAnalysis = analysis.map(item => {
            if (!isAdvanced) {
                // Free users get basic indicators only
                return {
                    AnalysisDate: item.AnalysisDate,
                    RSI: item.RSI,
                    MACD: item.MACD,
                    SMA20: item.SMA20,
                    SMA50: item.SMA50,
                    OverallScore: item.OverallScore
                };
            }
            return item;
        });

        res.json({
            success: true,
            data: {
                stock: stock.toObject(),
                timeFrame,
                days: parseInt(days),
                analysis: filteredAnalysis,
                isAdvanced
            }
        });

    } catch (error) {
        logger.error('Get technical analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get technical analysis',
            messageArabic: 'فشل في الحصول على التحليل الفني'
        });
    }
});

// Get stock statistics
router.get('/:symbol/stats', optionalAuth, [
    query('days').optional().isInt({ min: 1, max: 365 })
], async (req, res) => {
    try {
        const { symbol } = req.params;
        const { days = 30 } = req.query;

        const stock = await Stock.findBySymbol(symbol.toUpperCase());
        if (!stock) {
            return res.status(404).json({
                success: false,
                message: 'Stock not found',
                messageArabic: 'السهم غير موجود'
            });
        }

        const stats = await stock.getBasicStats(parseInt(days));

        res.json({
            success: true,
            data: {
                stock: stock.toObject(),
                period: parseInt(days),
                statistics: stats
            }
        });

    } catch (error) {
        logger.error('Get stock statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get stock statistics',
            messageArabic: 'فشل في الحصول على إحصائيات السهم'
        });
    }
});

module.exports = router;
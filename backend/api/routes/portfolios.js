// Portfolio Management API Routes
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Portfolio = require('../../models/Portfolio');
const Stock = require('../../models/Stock');
const { authenticate, requireFeature } = require('../../middleware/auth');
const logger = require('../../utils/logger');

const router = express.Router();

// Get user portfolios
router.get('/', authenticate, requireFeature('portfolio_tracking'), async (req, res) => {
    try {
        const portfolios = await Portfolio.findByUserId(req.user.id);

        res.json({
            success: true,
            data: {
                portfolios: portfolios.map(p => p.toObject())
            }
        });

    } catch (error) {
        logger.error('Get portfolios error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get portfolios',
            messageArabic: 'فشل في الحصول على المحافظ الاستثمارية'
        });
    }
});

// Create new portfolio
router.post('/', authenticate, requireFeature('portfolio_tracking'), [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('initialCapital').isFloat({ min: 1000 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                messageArabic: 'فشل في التحقق من البيانات',
                errors: errors.array()
            });
        }

        const { name, description, initialCapital, currency = 'EGP' } = req.body;

        const portfolioData = {
            userId: req.user.id,
            name,
            description,
            initialCapital,
            currency,
            cashBalance: initialCapital
        };

        const portfolio = await Portfolio.create(portfolioData);

        logger.info(`Portfolio created: ${name} by user ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Portfolio created successfully',
            messageArabic: 'تم إنشاء المحفظة الاستثمارية بنجاح',
            data: {
                portfolio: portfolio.toObject()
            }
        });

    } catch (error) {
        logger.error('Create portfolio error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create portfolio',
            messageArabic: 'فشل في إنشاء المحفظة الاستثمارية'
        });
    }
});

module.exports = router;
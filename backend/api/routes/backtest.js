/**
 * Backtesting API Routes
 * Egyptian Stock Exchange Trading Platform
 */

const express = require('express');
const router = express.Router();
const backtestingService = require('../../services/backtestingService');
const { validateRequest } = require('../middleware/validation');
const auth = require('../../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const logger = require('../../utils/logger');

// Apply authentication to all backtest routes
router.use(auth.authenticate);

/**
 * @route   POST /api/backtest
 * @desc    Create and start a new backtest
 * @access  Private
 */
router.post('/',
    rateLimit.strict,
    validateRequest('createBacktest'),
    async (req, res) => {
        try {
            const result = await backtestingService.createBacktest(req.user.id, req.body);
            
            res.status(201).json({
                success: true,
                message: result.message,
                message_ar: 'تم إنشاء اختبار الأداء وبدء التنفيذ',
                data: result.data
            });
        } catch (error) {
            logger.error('Error creating backtest:', error);
            const statusCode = error.message.includes('date') ? 400 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message,
                message_ar: statusCode === 400 ? 'خطأ في التواريخ المحددة' : 'فشل في إنشاء اختبار الأداء'
            });
        }
    }
);

/**
 * @route   GET /api/backtest
 * @desc    Get user's backtest history
 * @access  Private
 */
router.get('/',
    rateLimit.general,
    async (req, res) => {
        try {
            const { page = 1, limit = 20 } = req.query;
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

            const result = await backtestingService.getUserBacktests(req.user.id, pageNum, limitNum);
            
            res.json({
                success: true,
                message: 'Backtest history retrieved successfully',
                message_ar: 'تم استرجاع تاريخ اختبارات الأداء بنجاح',
                data: result.data
            });
        } catch (error) {
            logger.error('Error fetching backtest history:', error);
            res.status(500).json({
                success: false,
                message: error.message,
                message_ar: 'فشل في استرجاع تاريخ اختبارات الأداء'
            });
        }
    }
);

/**
 * @route   GET /api/backtest/:id
 * @desc    Get detailed backtest results
 * @access  Private
 */
router.get('/:id',
    rateLimit.general,
    validateRequest('backtestId'),
    async (req, res) => {
        try {
            const result = await backtestingService.getBacktestResults(req.params.id, req.user.id);
            
            res.json({
                success: true,
                message: 'Backtest results retrieved successfully',
                message_ar: 'تم استرجاع نتائج اختبار الأداء بنجاح',
                data: result.data
            });
        } catch (error) {
            logger.error('Error fetching backtest results:', error);
            const statusCode = error.message.includes('not found') || error.message.includes('access denied') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message,
                message_ar: statusCode === 404 ? 'اختبار الأداء غير موجود أو غير مسموح بالوصول' : 'فشل في استرجاع نتائج اختبار الأداء'
            });
        }
    }
);

/**
 * @route   DELETE /api/backtest/:id
 * @desc    Delete a backtest
 * @access  Private
 */
router.delete('/:id',
    rateLimit.strict,
    validateRequest('backtestId'),
    async (req, res) => {
        try {
            const result = await backtestingService.deleteBacktest(req.params.id, req.user.id);
            
            res.json({
                success: true,
                message: result.message,
                message_ar: 'تم حذف اختبار الأداء بنجاح'
            });
        } catch (error) {
            logger.error('Error deleting backtest:', error);
            const statusCode = error.message.includes('not found') || error.message.includes('access denied') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message,
                message_ar: statusCode === 404 ? 'اختبار الأداء غير موجود أو غير مسموح بالوصول' : 'فشل في حذف اختبار الأداء'
            });
        }
    }
);

/**
 * @route   GET /api/backtest/strategies/available
 * @desc    Get list of available trading strategies
 * @access  Private
 */
router.get('/strategies/available',
    rateLimit.general,
    async (req, res) => {
        try {
            const strategies = [
                {
                    id: 'momentum_rsi',
                    name: 'Momentum RSI Strategy',
                    name_ar: 'استراتيجية مؤشر القوة النسبية',
                    description: 'Buy when RSI is oversold, sell when overbought',
                    description_ar: 'شراء عند انخفاض مؤشر القوة النسبية، بيع عند ارتفاعه',
                    parameters: [
                        {
                            name: 'rsiPeriod',
                            type: 'integer',
                            default: 14,
                            min: 5,
                            max: 50,
                            description: 'RSI calculation period',
                            description_ar: 'فترة حساب مؤشر القوة النسبية'
                        },
                        {
                            name: 'oversoldLevel',
                            type: 'number',
                            default: 30,
                            min: 10,
                            max: 40,
                            description: 'Oversold threshold level',
                            description_ar: 'مستوى الإشارة للشراء'
                        },
                        {
                            name: 'overboughtLevel',
                            type: 'number',
                            default: 70,
                            min: 60,
                            max: 90,
                            description: 'Overbought threshold level',
                            description_ar: 'مستوى الإشارة للبيع'
                        }
                    ]
                },
                {
                    id: 'mean_reversion',
                    name: 'Mean Reversion Strategy',
                    name_ar: 'استراتيجية العودة للمتوسط',
                    description: 'Buy when price deviates significantly below average, sell when above',
                    description_ar: 'شراء عند انحراف السعر أسفل المتوسط، بيع عند الارتفاع فوقه',
                    parameters: [
                        {
                            name: 'lookbackPeriod',
                            type: 'integer',
                            default: 20,
                            min: 10,
                            max: 100,
                            description: 'Number of days to calculate average',
                            description_ar: 'عدد الأيام لحساب المتوسط'
                        },
                        {
                            name: 'deviationThreshold',
                            type: 'number',
                            default: 2,
                            min: 1,
                            max: 4,
                            description: 'Standard deviation threshold',
                            description_ar: 'عتبة الانحراف المعياري'
                        }
                    ]
                },
                {
                    id: 'breakout',
                    name: 'Breakout Strategy',
                    name_ar: 'استراتيجية الاختراق',
                    description: 'Buy on upward breakouts, sell on downward breakouts',
                    description_ar: 'شراء عند الاختراق الصاعد، بيع عند الاختراق الهابط',
                    parameters: [
                        {
                            name: 'lookbackPeriod',
                            type: 'integer',
                            default: 20,
                            min: 5,
                            max: 50,
                            description: 'Lookback period for high/low calculation',
                            description_ar: 'فترة حساب أعلى وأقل سعر'
                        },
                        {
                            name: 'volumeMultiplier',
                            type: 'number',
                            default: 1.5,
                            min: 1.1,
                            max: 3.0,
                            description: 'Volume confirmation multiplier',
                            description_ar: 'مضاعف تأكيد الحجم'
                        }
                    ]
                },
                {
                    id: 'buy_and_hold',
                    name: 'Buy and Hold Strategy',
                    name_ar: 'استراتيجية الشراء والاحتفاظ',
                    description: 'Buy at the beginning and hold until the end',
                    description_ar: 'شراء في البداية والاحتفاظ حتى النهاية',
                    parameters: [
                        {
                            name: 'investmentPerSymbol',
                            type: 'number',
                            default: 10000,
                            min: 1000,
                            max: 100000,
                            description: 'Investment amount per symbol',
                            description_ar: 'مبلغ الاستثمار لكل رمز'
                        }
                    ]
                }
            ];

            res.json({
                success: true,
                message: 'Available strategies retrieved successfully',
                message_ar: 'تم استرجاع الاستراتيجيات المتاحة بنجاح',
                data: strategies
            });
        } catch (error) {
            logger.error('Error fetching available strategies:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch available strategies',
                message_ar: 'فشل في استرجاع الاستراتيجيات المتاحة'
            });
        }
    }
);

/**
 * @route   POST /api/backtest/validate
 * @desc    Validate backtest configuration before running
 * @access  Private
 */
router.post('/validate',
    rateLimit.general,
    validateRequest('validateBacktest'),
    async (req, res) => {
        try {
            const { symbols, startDate, endDate, initialCapital, strategy, parameters } = req.body;
            const validationErrors = [];

            // Validate date range
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (start >= end) {
                validationErrors.push({
                    field: 'dateRange',
                    message: 'Start date must be before end date',
                    message_ar: 'يجب أن يكون تاريخ البداية قبل تاريخ النهاية'
                });
            }

            if (end > new Date()) {
                validationErrors.push({
                    field: 'endDate',
                    message: 'End date cannot be in the future',
                    message_ar: 'لا يمكن أن يكون تاريخ النهاية في المستقبل'
                });
            }

            // Calculate minimum required period based on strategy
            const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            let minRequiredDays = 30;

            if (strategy === 'momentum_rsi') {
                const rsiPeriod = parameters?.rsiPeriod || 14;
                minRequiredDays = Math.max(minRequiredDays, rsiPeriod * 2);
            } else if (strategy === 'mean_reversion') {
                const lookbackPeriod = parameters?.lookbackPeriod || 20;
                minRequiredDays = Math.max(minRequiredDays, lookbackPeriod * 2);
            }

            if (daysDiff < minRequiredDays) {
                validationErrors.push({
                    field: 'dateRange',
                    message: `Date range too short. Minimum ${minRequiredDays} days required for this strategy`,
                    message_ar: `فترة التاريخ قصيرة جداً. يتطلب الحد الأدنى ${minRequiredDays} يوم لهذه الاستراتيجية`
                });
            }

            // Validate symbols exist in database
            if (symbols && symbols.length > 0) {
                const db = require('../../config/database');
                const symbolsQuery = `
                    SELECT symbol FROM stocks 
                    WHERE symbol IN (${symbols.map(() => '?').join(',')}) 
                    AND is_active = 1
                `;
                
                try {
                    const validSymbols = await db.query(symbolsQuery, symbols);
                    const validSymbolList = validSymbols.map(s => s.symbol);
                    const invalidSymbols = symbols.filter(s => !validSymbolList.includes(s));
                    
                    if (invalidSymbols.length > 0) {
                        validationErrors.push({
                            field: 'symbols',
                            message: `Invalid symbols: ${invalidSymbols.join(', ')}`,
                            message_ar: `رموز غير صحيحة: ${invalidSymbols.join(', ')}`
                        });
                    }
                } catch (dbError) {
                    logger.warn('Error validating symbols:', dbError);
                }
            }

            // Validate initial capital
            if (initialCapital < 10000) {
                validationErrors.push({
                    field: 'initialCapital',
                    message: 'Minimum initial capital is 10,000 EGP',
                    message_ar: 'الحد الأدنى لرأس المال الأولي هو 10,000 جنيه'
                });
            }

            const isValid = validationErrors.length === 0;

            res.json({
                success: true,
                message: isValid ? 'Configuration is valid' : 'Configuration has errors',
                message_ar: isValid ? 'الإعدادات صحيحة' : 'الإعدادات تحتوي على أخطاء',
                data: {
                    isValid,
                    errors: validationErrors,
                    estimatedDuration: daysDiff > 100 ? 'Long (>5 minutes)' : daysDiff > 30 ? 'Medium (1-5 minutes)' : 'Short (<1 minute)',
                    estimatedTrades: Math.ceil(daysDiff * symbols?.length * 0.1) // Rough estimate
                }
            });
        } catch (error) {
            logger.error('Error validating backtest configuration:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to validate configuration',
                message_ar: 'فشل في التحقق من الإعدادات'
            });
        }
    }
);

/**
 * @route   GET /api/backtest/stats
 * @desc    Get user backtest statistics
 * @access  Private
 */
router.get('/stats',
    rateLimit.general,
    async (req, res) => {
        try {
            const db = require('../../config/database');
            
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_backtests,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_backtests,
                    COUNT(CASE WHEN status = 'running' THEN 1 END) as running_backtests,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_backtests,
                    AVG(CASE WHEN status = 'completed' AND total_return IS NOT NULL THEN total_return END) as avg_return,
                    MAX(CASE WHEN status = 'completed' AND total_return IS NOT NULL THEN total_return END) as best_return,
                    MIN(CASE WHEN status = 'completed' AND total_return IS NOT NULL THEN total_return END) as worst_return,
                    AVG(CASE WHEN status = 'completed' AND sharpe_ratio IS NOT NULL THEN sharpe_ratio END) as avg_sharpe_ratio
                FROM backtest_runs 
                WHERE user_id = @userId
            `;

            const strategyStatsQuery = `
                SELECT 
                    strategy_name,
                    COUNT(*) as count,
                    AVG(CASE WHEN status = 'completed' AND total_return IS NOT NULL THEN total_return END) as avg_return,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
                FROM backtest_runs 
                WHERE user_id = @userId
                GROUP BY strategy_name
                ORDER BY count DESC
            `;

            const [overallStats, strategyStats] = await Promise.all([
                db.query(statsQuery, { userId: req.user.id }),
                db.query(strategyStatsQuery, { userId: req.user.id })
            ]);

            res.json({
                success: true,
                message: 'Backtest statistics retrieved successfully',
                message_ar: 'تم استرجاع إحصائيات اختبارات الأداء بنجاح',
                data: {
                    overall: overallStats[0] || {},
                    byStrategy: strategyStats || []
                }
            });
        } catch (error) {
            logger.error('Error fetching backtest statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch backtest statistics',
                message_ar: 'فشل في استرجاع إحصائيات اختبارات الأداء'
            });
        }
    }
);

module.exports = router;

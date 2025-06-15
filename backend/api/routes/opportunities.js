const express = require('express');
const rateLimit = require('express-rate-limit');
const { validationResult, query, param } = require('express-validator');
const opportunityHunterService = require('../../services/opportunityHunter');
const logger = require('../../utils/logger');

const router = express.Router();

// Rate limiting for opportunity endpoints
const opportunityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests to opportunity endpoints, please try again later.'
});

router.use(opportunityLimiter);

/**
 * @route   GET /api/opportunities/latest
 * @desc    Get the latest opportunity scan results
 * @access  Public
 */
router.get('/latest', async (req, res) => {
  try {
    const opportunities = await opportunityHunterService.getLatestOpportunities();
    
    if (!opportunities || !opportunities.opportunities) {
      return res.status(404).json({
        success: false,
        message: 'No opportunity data available. Please wait for the next scan.',
        data: null
      });
    }

    // Add Arabic translation for response
    const response = {
      success: true,
      message: 'تم جلب الفرص بنجاح',
      data: {
        scanInfo: {
          scanTime: opportunities.scanTime,
          totalScanned: opportunities.totalScanned || 0,
          qualified: opportunities.qualified || 0,
          topOpportunities: opportunities.topOpportunities || 0,
          nextScan: getNextScanTime()
        },
        marketConditions: opportunities.marketConditions || {
          trend: 'neutral',
          volatility: 'moderate',
          volume: 'average',
          sentiment: 'neutral'
        },
        opportunities: opportunities.opportunities.map(formatOpportunityForAPI)
      }
    };

    res.json(response);
  } catch (error) {
    logger.error('Failed to get latest opportunities:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الفرص الاستثمارية',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/opportunities/symbol/:symbol
 * @desc    Get detailed opportunity analysis for a specific symbol
 * @access  Public
 */
router.get('/symbol/:symbol', [
  param('symbol').isString().notEmpty().withMessage('Symbol is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { symbol } = req.params;
    const opportunity = await opportunityHunterService.getOpportunityDetails(symbol.toUpperCase());
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: `لم يتم العثور على فرصة للرمز: ${symbol}`,
        data: null
      });
    }

    const response = {
      success: true,
      message: 'تم جلب تفاصيل الفرصة بنجاح',
      data: formatDetailedOpportunityForAPI(opportunity)
    };

    res.json(response);
  } catch (error) {
    logger.error(`Failed to get opportunity details for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب تفاصيل الفرصة',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/opportunities/scan
 * @desc    Force a new market scan
 * @access  Public (with rate limiting)
 */
router.post('/scan', rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // maximum 3 forced scans per 5 minutes
  message: 'Too many scan requests. Please wait before requesting another scan.'
}), async (req, res) => {
  try {
    logger.info('Force scan requested via API');
    
    const scanResult = await opportunityHunterService.forceRescan();
    
    const response = {
      success: true,
      message: 'تم تشغيل المسح بنجاح',
      data: {
        scanTime: new Date().toISOString(),
        totalOpportunities: scanResult.length,
        opportunities: scanResult.slice(0, 10).map(formatOpportunityForAPI) // Return top 10
      }
    };

    res.json(response);
  } catch (error) {
    logger.error('Failed to force scan:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تشغيل المسح',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/opportunities/alerts
 * @desc    Get high-priority opportunity alerts
 * @access  Public
 */
router.get('/alerts', [
  query('minScore').optional().isFloat({ min: 0, max: 1 }).withMessage('Score must be between 0 and 1'),
  query('urgency').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid urgency level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const minScore = parseFloat(req.query.minScore) || 0.8;
    const urgency = req.query.urgency || 'HIGH';

    const opportunities = await opportunityHunterService.getLatestOpportunities();
    
    if (!opportunities || !opportunities.opportunities) {
      return res.status(404).json({
        success: false,
        message: 'لا توجد بيانات متاحة',
        data: []
      });
    }

    // Filter high-priority opportunities
    const alerts = opportunities.opportunities
      .filter(op => 
        op.score >= minScore && 
        op.recommendation && 
        op.recommendation.urgency === urgency
      )
      .map(formatAlertForAPI);

    const response = {
      success: true,
      message: `تم العثور على ${alerts.length} تنبيه`,
      data: {
        alertTime: new Date().toISOString(),
        criteria: { minScore, urgency },
        totalAlerts: alerts.length,
        alerts: alerts
      }
    };

    res.json(response);
  } catch (error) {
    logger.error('Failed to get opportunity alerts:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب التنبيهات',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/opportunities/status
 * @desc    Get opportunity hunter system status
 * @access  Public
 */
router.get('/status', async (req, res) => {
  try {
    const status = opportunityHunterService.getStatus();
    
    const response = {
      success: true,
      message: 'حالة النظام',
      data: {
        system: {
          initialized: status.initialized,
          scanning: status.scanning,
          lastScanTime: status.lastScanTime,
          totalOpportunities: status.totalOpportunities,
          nextScanTime: getNextScanTime()
        },
        performance: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version
        },
        marketHours: {
          isMarketOpen: isMarketOpen(),
          nextMarketOpen: getNextMarketOpen(),
          timezone: 'Africa/Cairo'
        }
      }
    };

    res.json(response);
  } catch (error) {
    logger.error('Failed to get system status:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب حالة النظام',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/opportunities/sectors
 * @desc    Get opportunities grouped by sector
 * @access  Public
 */
router.get('/sectors', async (req, res) => {
  try {
    const opportunities = await opportunityHunterService.getLatestOpportunities();
    
    if (!opportunities || !opportunities.opportunities) {
      return res.status(404).json({
        success: false,
        message: 'لا توجد بيانات متاحة',
        data: {}
      });
    }

    // Group opportunities by sector
    const sectorGroups = {};
    opportunities.opportunities.forEach(opportunity => {
      const sector = opportunity.sector || 'غير محدد';
      if (!sectorGroups[sector]) {
        sectorGroups[sector] = {
          name: sector,
          count: 0,
          averageScore: 0,
          opportunities: []
        };
      }
      sectorGroups[sector].opportunities.push(formatOpportunityForAPI(opportunity));
      sectorGroups[sector].count++;
    });

    // Calculate average scores
    Object.keys(sectorGroups).forEach(sector => {
      const opportunities = sectorGroups[sector].opportunities;
      const totalScore = opportunities.reduce((sum, op) => sum + op.score, 0);
      sectorGroups[sector].averageScore = +(totalScore / opportunities.length).toFixed(3);
    });

    const response = {
      success: true,
      message: 'تم جلب الفرص حسب القطاعات',
      data: {
        scanTime: opportunities.scanTime,
        totalSectors: Object.keys(sectorGroups).length,
        sectors: sectorGroups
      }
    };

    res.json(response);
  } catch (error) {
    logger.error('Failed to get opportunities by sector:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الفرص حسب القطاعات',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper functions

/**
 * Format opportunity data for API response
 * @private
 */
function formatOpportunityForAPI(opportunity) {
  return {
    rank: opportunity.rank || 0,
    symbol: opportunity.symbol,
    companyName: opportunity.companyName,
    companyNameAr: getArabicCompanyName(opportunity.symbol),
    sector: opportunity.sector,
    sectorAr: getArabicSectorName(opportunity.sector),
    currentPrice: +opportunity.currentPrice.toFixed(2),
    score: +opportunity.score.toFixed(3),
    confidence: opportunity.confidence,
    confidenceAr: getArabicConfidence(opportunity.confidence),
    discoveryTime: opportunity.discoveryTime,
    recommendation: formatRecommendationForAPI(opportunity.recommendation),
    catalysts: opportunity.catalysts || [],
    catalystsAr: translateCatalysts(opportunity.catalysts || []),
    timeframe: opportunity.timeframe,
    timeframeAr: getArabicTimeframe(opportunity.timeframe),
    riskLevel: opportunity.riskLevel,
    riskLevelAr: getArabicRiskLevel(opportunity.riskLevel)
  };
}

/**
 * Format detailed opportunity data for API response
 * @private
 */
function formatDetailedOpportunityForAPI(opportunity) {
  const basic = formatOpportunityForAPI(opportunity);
  
  return {
    ...basic,
    signals: {
      momentum: formatSignalForAPI(opportunity.signals.momentum, 'momentum'),
      volume: formatSignalForAPI(opportunity.signals.volume, 'volume'),
      priceAction: formatSignalForAPI(opportunity.signals.priceAction, 'priceAction'),
      patterns: formatSignalForAPI(opportunity.signals.patterns, 'patterns')
    },
    analysis: {
      strengths: identifyStrengths(opportunity.signals),
      weaknesses: identifyWeaknesses(opportunity.signals),
      keyLevels: extractKeyLevels(opportunity.signals),
      riskFactors: identifyRiskFactors(opportunity.signals)
    }
  };
}

/**
 * Format recommendation data for API response
 * @private
 */
function formatRecommendationForAPI(recommendation) {
  if (!recommendation) return null;
  
  return {
    action: recommendation.action,
    actionAr: getArabicAction(recommendation.action),
    urgency: recommendation.urgency,
    urgencyAr: getArabicUrgency(recommendation.urgency),
    entryZone: {
      min: +recommendation.entryZone[0].toFixed(2),
      max: +recommendation.entryZone[1].toFixed(2)
    },
    targets: recommendation.targets.map(target => ({
      level: target.level,
      price: +target.price.toFixed(2),
      probability: +(target.probability * 100).toFixed(1)
    })),
    stopLoss: +recommendation.stopLoss.toFixed(2),
    riskReward: +recommendation.riskReward.toFixed(2),
    positionSize: recommendation.positionSize,
    positionSizeAr: getArabicPositionSize(recommendation.positionSize)
  };
}

/**
 * Format alert data for API response
 * @private
 */
function formatAlertForAPI(opportunity) {
  return {
    type: 'OPPORTUNITY_ALERT',
    typeAr: 'تنبيه فرصة استثمارية',
    symbol: opportunity.symbol,
    companyName: opportunity.companyName,
    companyNameAr: getArabicCompanyName(opportunity.symbol),
    score: +opportunity.score.toFixed(3),
    message: {
      en: `High-probability opportunity detected in ${opportunity.companyName} (${opportunity.symbol})`,
      ar: `تم اكتشاف فرصة عالية الاحتمالية في ${getArabicCompanyName(opportunity.symbol)} (${opportunity.symbol})`
    },
    recommendation: formatRecommendationForAPI(opportunity.recommendation),
    urgency: opportunity.recommendation?.urgency || 'HIGH',
    expiresIn: '2 hours',
    createdAt: new Date().toISOString()
  };
}

// Utility functions for translations and calculations

function getArabicCompanyName(symbol) {
  const arabicNames = {
    'CIB.CA': 'البنك التجاري الدولي',
    'COMI.CA': 'بنك مصر',
    'ETEL.CA': 'المصرية للاتصالات',
    'HRHO.CA': 'حسن علام هولدنج',
    'EMFD.CA': 'إعمار مصر للتنمية',
    // Add more mappings as needed
  };
  
  return arabicNames[symbol] || symbol.replace('.CA', '');
}

function getArabicSectorName(sector) {
  const arabicSectors = {
    'Banking': 'البنوك',
    'Telecommunications': 'الاتصالات',
    'Real Estate': 'العقارات',
    'Industrial': 'الصناعات',
    'Transportation': 'النقل والمواصلات',
    'Healthcare': 'الرعاية الصحية',
    'Energy': 'الطاقة',
    'Technology': 'التكنولوجيا'
  };
  
  return arabicSectors[sector] || sector;
}

function getArabicConfidence(confidence) {
  const arabicConfidence = {
    'VERY_HIGH': 'عالية جداً',
    'HIGH': 'عالية',
    'MEDIUM': 'متوسطة',
    'LOW': 'منخفضة'
  };
  
  return arabicConfidence[confidence] || confidence;
}

function getArabicAction(action) {
  const arabicActions = {
    'STRONG_BUY': 'شراء قوي',
    'BUY': 'شراء',
    'WEAK_BUY': 'شراء ضعيف',
    'HOLD': 'احتفاظ',
    'SELL': 'بيع',
    'STRONG_SELL': 'بيع قوي'
  };
  
  return arabicActions[action] || action;
}

function getArabicUrgency(urgency) {
  const arabicUrgency = {
    'HIGH': 'عالية',
    'MEDIUM': 'متوسطة',
    'LOW': 'منخفضة'
  };
  
  return arabicUrgency[urgency] || urgency;
}

function getArabicTimeframe(timeframe) {
  const arabicTimeframes = {
    '1-2 weeks': '1-2 أسبوع',
    '2-4 weeks': '2-4 أسابيع',
    '2-8 weeks': '2-8 أسابيع',
    '1-3 months': '1-3 شهور'
  };
  
  return arabicTimeframes[timeframe] || timeframe;
}

function getArabicRiskLevel(riskLevel) {
  const arabicRiskLevels = {
    'LOW': 'منخفضة',
    'MEDIUM': 'متوسطة',
    'HIGH': 'عالية'
  };
  
  return arabicRiskLevels[riskLevel] || riskLevel;
}

function getArabicPositionSize(positionSize) {
  return positionSize.replace(/(\d+)-(\d+)% of portfolio/, '$1-$2% من المحفظة');
}

function translateCatalysts(catalysts) {
  const translations = {
    'High volume accumulation detected': 'تم اكتشاف تراكم بحجم عالي',
    'Resistance breakout confirmed': 'تأكيد كسر المقاومة',
    'Strong momentum indicators': 'مؤشرات زخم قوية',
    'Technical pattern completion': 'اكتمال النموذج الفني',
    'Institutional accumulation pattern': 'نموذج تراكم مؤسسي',
    'Sector rotation detected': 'تم اكتشاف دوران قطاعي'
  };
  
  return catalysts.map(catalyst => translations[catalyst] || catalyst);
}

function formatSignalForAPI(signal, type) {
  if (!signal) return null;
  
  return {
    score: +signal.score.toFixed(3),
    strength: getSignalStrength(signal.score),
    strengthAr: getArabicSignalStrength(signal.score),
    details: signal.details || {}
  };
}

function getSignalStrength(score) {
  if (score >= 0.8) return 'Very Strong';
  if (score >= 0.6) return 'Strong';
  if (score >= 0.4) return 'Moderate';
  if (score >= 0.2) return 'Weak';
  return 'Very Weak';
}

function getArabicSignalStrength(score) {
  if (score >= 0.8) return 'قوية جداً';
  if (score >= 0.6) return 'قوية';
  if (score >= 0.4) return 'متوسطة';
  if (score >= 0.2) return 'ضعيفة';
  return 'ضعيفة جداً';
}

function identifyStrengths(signals) {
  const strengths = [];
  
  if (signals.momentum?.score > 0.7) strengths.push('Strong momentum indicators');
  if (signals.volume?.score > 0.7) strengths.push('High volume confirmation');
  if (signals.priceAction?.score > 0.7) strengths.push('Solid price action');
  if (signals.patterns?.score > 0.7) strengths.push('Clear technical patterns');
  
  return strengths;
}

function identifyWeaknesses(signals) {
  const weaknesses = [];
  
  if (signals.momentum?.score < 0.4) weaknesses.push('Weak momentum');
  if (signals.volume?.score < 0.4) weaknesses.push('Low volume');
  if (signals.priceAction?.score < 0.4) weaknesses.push('Unclear price action');
  if (signals.patterns?.score < 0.4) weaknesses.push('No clear patterns');
  
  return weaknesses;
}

function extractKeyLevels(signals) {
  const levels = {};
  
  if (signals.priceAction?.details?.supportResistance) {
    levels.support = signals.priceAction.details.supportResistance.support;
    levels.resistance = signals.priceAction.details.supportResistance.resistance;
    levels.pivot = signals.priceAction.details.supportResistance.pivot;
  }
  
  return levels;
}

function identifyRiskFactors(signals) {
  const risks = [];
  
  if (signals.volume?.score < 0.5) risks.push('Low volume confirmation');
  if (!signals.priceAction?.details?.supportHold) risks.push('Support level concern');
  
  return risks;
}

function getNextScanTime() {
  const now = new Date();
  const nextScan = new Date(now.getTime() + 5 * 60 * 1000); // Next scan in 5 minutes
  return nextScan.toISOString();
}

function isMarketOpen() {
  const now = new Date();
  const cairoTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
  const hour = cairoTime.getHours();
  const day = cairoTime.getDay();
  
  // Market is open Sunday to Thursday, 10:00 AM to 2:30 PM Cairo time
  return day >= 0 && day <= 4 && hour >= 10 && hour < 14;
}

function getNextMarketOpen() {
  const now = new Date();
  const cairoTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
  
  // Calculate next market open (simplified)
  const nextOpen = new Date(cairoTime);
  nextOpen.setHours(10, 0, 0, 0);
  
  if (cairoTime.getHours() >= 14 || cairoTime.getDay() === 5 || cairoTime.getDay() === 6) {
    // Move to next trading day
    nextOpen.setDate(nextOpen.getDate() + 1);
    while (nextOpen.getDay() === 5 || nextOpen.getDay() === 6) {
      nextOpen.setDate(nextOpen.getDate() + 1);
    }
  }
  
  return nextOpen.toISOString();
}

module.exports = router;

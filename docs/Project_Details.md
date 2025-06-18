# 📊 EGXpilot - دليل شامل للمشروع

## 🎯 نظرة عامة

EGXpilot هو نظام ذكي متطور لتحليل الأسهم المصرية وتقديم توصيات استثمارية مبنية على التحليل الفني المتقدم وخوارزميات الذكاء الاصطناعي.

## 🏗️ آلية عمل النظام

### 1. **تدفق البيانات (Data Flow)**
```
Yahoo Finance API → Data Collector → SQL Server → Technical Analysis → Opportunity Hunter → API Endpoints
```

#### **مراحل المعالجة:**
1. **جمع البيانات**: من Yahoo Finance API للأسهم المصرية
2. **تخزين البيانات**: في SQL Server مع فهرسة محسنة
3. **التحليل الفني**: حساب المؤشرات الفنية (RSI, MACD, etc.)
4. **اكتشاف الفرص**: مسح تلقائي للفرص الاستثمارية
5. **تقديم التوصيات**: عبر API مع نظام نقاط ذكي

### 2. **أنواع التحليل المطبقة**

#### **المؤشرات الفنية:**
- **RSI (Relative Strength Index)**: قياس قوة الزخم
- **MACD**: تقارب وتباعد المتوسطات المتحركة
- **Bollinger Bands**: قنوات السعر والتقلبات
- **SMA/EMA**: المتوسطات المتحركة البسيطة والأسية
- **Stochastic**: مؤشر الزخم المتذبذب

#### **تحليل الحجم:**
- **Volume Profile**: توزيع الحجم عند مستويات السعر
- **OBV (On-Balance Volume)**: الحجم التراكمي
- **Volume Trend Analysis**: اتجاه الحجم

#### **اكتشاف الأنماط:**
- **Divergence Detection**: اكتشاف التباعد الإيجابي/السلبي
- **Support/Resistance**: مستويات الدعم والمقاومة
- **Trend Analysis**: تحليل الاتجاه العام

## � هيكل المشروع التفصيلي

### 🔧 **Backend Structure**
```
backend/
├── server.js                    # 🚀 الخادم الرئيسي
│   ├── Express app setup       # إعداد التطبيق
│   ├── Middleware configuration # إعداد الوسطاء
│   ├── Routes registration     # تسجيل المسارات
│   ├── Database connection     # اتصال قاعدة البيانات
│   ├── Redis connection        # اتصال Redis
│   ├── Socket.IO setup         # إعداد WebSocket
│   └── Error handling          # معالجة الأخطاء
│
├── api/                        # 🔌 واجهات برمجة التطبيقات
│   ├── routes/                 # مسارات API
│   │   ├── auth.js            # 🔐 مصادقة المستخدمين
│   │   │   ├── POST /register  # تسجيل مستخدم جديد
│   │   │   ├── POST /login     # تسجيل دخول
│   │   │   ├── POST /logout    # تسجيل خروج
│   │   │   ├── POST /refresh   # تجديد الرمز المميز
│   │   │   └── GET /profile    # معلومات المستخدم
│   │   │
│   │   ├── stocks.js          # 📈 بيانات الأسهم
│   │   │   ├── GET /           # قائمة جميع الأسهم
│   │   │   ├── GET /:symbol    # تفاصيل سهم معين
│   │   │   ├── GET /:symbol/history # البيانات التاريخية
│   │   │   └── GET /:symbol/realtime # البيانات الحية
│   │   │
│   │   ├── analysis.js        # 🔍 التحليل الفني
│   │   │   ├── GET /:symbol/indicators # المؤشرات الفنية
│   │   │   ├── GET /:symbol/patterns   # الأنماط
│   │   │   ├── POST /:symbol/analyze   # تحليل مخصص
│   │   │   └── GET /:symbol/signals    # إشارات التداول
│   │   │
│   │   ├── opportunities.js   # 💎 الفرص الذهبية
│   │   │   ├── GET /latest     # أحدث الفرص
│   │   │   ├── POST /scan      # مسح جديد
│   │   │   ├── GET /history    # تاريخ الفرص
│   │   │   └── GET /performance # أداء التوصيات
│   │   │
│   │   ├── portfolios.js      # 📊 إدارة المحافظ
│   │   │   ├── GET /           # قائمة المحافظ
│   │   │   ├── POST /          # إنشاء محفظة
│   │   │   ├── GET /:id        # تفاصيل محفظة
│   │   │   ├── PUT /:id        # تحديث محفظة
│   │   │   ├── DELETE /:id     # حذف محفظة
│   │   │   ├── POST /:id/positions # إضافة صفقة
│   │   │   └── GET /:id/performance # أداء المحفظة
│   │   │
│   │   └── alerts.js          # 🔔 نظام التنبيهات
│   │       ├── GET /           # قائمة التنبيهات
│   │       ├── POST /          # إنشاء تنبيه
│   │       ├── PUT /:id        # تحديث تنبيه
│   │       └── DELETE /:id     # حذف تنبيه
│   │
│   └── middleware/             # 🛡️ الوسطاء
│       ├── auth.js            # مصادقة JWT
│       ├── validation.js      # التحقق من البيانات
│       └── rateLimit.js       # تحديد معدل الطلبات
│
├── models/                     # 🗃️ نماذج البيانات
│   ├── User.js                # نموذج المستخدم
│   │   ├── register()         # تسجيل مستخدم
│   │   ├── authenticate()     # مصادقة
│   │   ├── updateProfile()    # تحديث الملف الشخصي
│   │   └── getPortfolios()    # محافظ المستخدم
│   │
│   ├── Stock.js               # نموذج الأسهم
│   │   ├── getBySymbol()      # البحث بالرمز
│   │   ├── getHistoricalData() # البيانات التاريخية
│   │   ├── updatePrice()      # تحديث السعر
│   │   └── searchStocks()     # البحث في الأسهم
│   │
│   └── Portfolio.js           # نموذج المحفظة
│       ├── create()           # إنشاء محفظة
│       ├── addPosition()      # إضافة صفقة
│       ├── calculatePnL()     # حساب الربح/الخسارة
│       └── getPerformance()   # حساب الأداء
│
├── services/                   # ⚙️ الخدمات
│   ├── dataCollectorService.js # 📥 جمع البيانات
│   │   ├── collectRealTimeData() # جمع البيانات الحية
│   │   ├── collectHistoricalData() # البيانات التاريخية
│   │   ├── updateStockPrices() # تحديث الأسعار
│   │   └── validateData()     # التحقق من البيانات
│   │
│   ├── technicalAnalysisService.js # 📊 التحليل الفني
│   │   ├── calculateRSI()     # حساب RSI
│   │   ├── calculateMACD()    # حساب MACD
│   │   ├── calculateBollinger() # حساب Bollinger Bands
│   │   ├── calculateSMA()     # المتوسط المتحرك البسيط
│   │   ├── calculateEMA()     # المتوسط المتحرك الأسي
│   │   ├── detectDivergence() # اكتشاف التباعد
│   │   └── generateSignals()  # توليد الإشارات
│   │
│   ├── opportunityHunter.js   # 🎯 محرك الفرص
│   │   ├── scanMarket()       # مسح السوق
│   │   ├── scoreOpportunity() # تقييم الفرصة
│   │   ├── filterOpportunities() # تصفية الفرص
│   │   └── generateRecommendations() # توليد التوصيات
│   │
│   ├── portfolioService.js    # 💼 خدمة المحافظ
│   │   ├── calculateReturns() # حساب العوائد
│   │   ├── assessRisk()       # تقييم المخاطر
│   │   ├── optimizePortfolio() # تحسين المحفظة
│   │   └── generateReports()  # تقارير الأداء
│   │
│   ├── alertsService.js       # 🚨 خدمة التنبيهات
│   │   ├── checkConditions()  # فحص الشروط
│   │   ├── sendAlert()        # إرسال تنبيه
│   │   ├── manageSubscriptions() # إدارة الاشتراكات
│   │   └── logAlerts()        # تسجيل التنبيهات
│   │
│   └── userService.js         # 👤 خدمة المستخدمين
│       ├── createUser()       # إنشاء مستخدم
│       ├── validateCredentials() # التحقق من البيانات
│       ├── updatePreferences() # تحديث التفضيلات
│       └── manageSubscriptions() # إدارة الاشتراكات
│
├── smart-analysis/             # 🧠 محرك التحليل الذكي
│   ├── indicators/            # المؤشرات الفنية
│   │   ├── momentum.js        # مؤشرات الزخم
│   │   │   ├── RSI calculation # حساب RSI
│   │   │   ├── Stochastic     # مؤشر العشوائية
│   │   │   ├── Williams %R    # مؤشر وليامز
│   │   │   └── ROC (Rate of Change) # معدل التغيير
│   │   │
│   │   └── trend.js           # مؤشرات الاتجاه
│   │       ├── Moving Averages # المتوسطات المتحركة
│   │       ├── MACD           # تقارب وتباعد المتوسطات
│   │       ├── ADX            # مؤشر الاتجاه المتوسط
│   │       └── Ichimoku       # سحابة إيشيموكو
│   │
│   ├── opportunity-hunter/    # 🎣 محرك اصطياد الفرص
│   │   └── scannerEngine.js   # محرك المسح
│   │       ├── Technical Scoring # نظام النقاط الفني
│   │       ├── Volume Analysis # تحليل الحجم
│   │       ├── Momentum Scoring # تقييم الزخم
│   │       ├── Risk Assessment # تقييم المخاطر
│   │       └── Opportunity Ranking # ترتيب الفرص
│   │
│   ├── patterns/              # 📋 اكتشاف الأنماط
│   │   ├── candlestick.js     # أنماط الشموع اليابانية
│   │   ├── chart-patterns.js  # أنماط الرسوم البيانية
│   │   └── divergence.js      # اكتشاف التباعد
│   │
│   ├── risk/                  # ⚡ إدارة المخاطر
│   │   ├── portfolioRisk.js   # مخاطر المحفظة
│   │   ├── positionSizing.js  # حجم الصفقات
│   │   └── stopLoss.js        # نقاط وقف الخسارة
│   │
│   └── strategies/            # 📝 الاستراتيجيات
│       ├── momentum.js        # استراتيجية الزخم
│       ├── meanReversion.js   # استراتيجية العودة للمتوسط
│       └── trendFollowing.js  # استراتيجية تتبع الاتجاه
│
├── data/                      # 📊 إدارة البيانات
│   ├── collectors/            # جامعات البيانات
│   │   └── yahooCollector.js  # جامع بيانات Yahoo Finance
│   │       ├── getRealTimeData() # البيانات الحية
│   │       ├── getHistoricalData() # البيانات التاريخية
│   │       ├── getBatchData()  # البيانات بالدفعات
│   │       └── handleErrors()  # معالجة الأخطاء
│   │
│   ├── validators/            # التحقق من البيانات
│   │   ├── priceValidator.js  # التحقق من الأسعار
│   │   ├── volumeValidator.js # التحقق من الحجم
│   │   └── dataIntegrity.js   # سلامة البيانات
│   │
│   └── cache/                 # التخزين المؤقت
│       ├── redisManager.js    # إدارة Redis
│       ├── cacheStrategies.js # استراتيجيات التخزين
│       └── dataRefresh.js     # تحديث البيانات
│
├── middleware/                # 🔒 الوسطاء الرئيسيين
│   └── auth.js               # نظام المصادقة المتقدم
│       ├── AuthService class  # فئة خدمة المصادقة
│       ├── JWT management     # إدارة JWT
│       ├── Session handling   # إدارة الجلسات
│       ├── Permission system  # نظام الصلاحيات
│       └── Security features  # ميزات الأمان
│
└── utils/                     # 🛠️ الأدوات المساعدة
    ├── logger.js             # نظام التسجيل
    │   ├── Winston setup     # إعداد Winston
    │   ├── Log levels        # مستويات التسجيل
    │   ├── File rotation     # دوران الملفات
    │   └── Error tracking    # تتبع الأخطاء
    │
    ├── helpers.js            # دوال مساعدة
    │   ├── Date formatting   # تنسيق التواريخ
    │   ├── Number formatting # تنسيق الأرقام
    │   ├── String utilities  # أدوات النصوص
    │   └── Math calculations # العمليات الحسابية
    │
    └── constants.js          # الثوابت
        ├── API endpoints     # نقاط API
        ├── Error codes       # رموز الأخطاء
        ├── Status codes      # رموز الحالة
        └── Configuration     # إعدادات ثابتة
```

### 🗄️ **Database Structure**

```sql
-- 👤 Users Table
Users (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    email NVARCHAR(255) UNIQUE,
    password_hash NVARCHAR(255),
    first_name NVARCHAR(100),
    last_name NVARCHAR(100),
    phone NVARCHAR(20),
    is_verified BIT DEFAULT 0,
    subscription_type NVARCHAR(50),
    created_at DATETIME2,
    updated_at DATETIME2
)

-- 📈 Stocks Table
Stocks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    symbol NVARCHAR(20) UNIQUE,
    name NVARCHAR(255),
    name_arabic NVARCHAR(255),
    sector NVARCHAR(100),
    market_cap DECIMAL(18,2),
    is_active BIT DEFAULT 1,
    created_at DATETIME2
)

-- 📊 Stock Data Table
StockData (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    stock_id INT FOREIGN KEY REFERENCES Stocks(id),
    date DATE,
    open_price DECIMAL(10,3),
    high_price DECIMAL(10,3),
    low_price DECIMAL(10,3),
    close_price DECIMAL(10,3),
    volume BIGINT,
    adjusted_close DECIMAL(10,3),
    created_at DATETIME2
)

-- 🔍 Technical Analysis Table
TechnicalAnalysis (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    stock_id INT FOREIGN KEY REFERENCES Stocks(id),
    date DATE,
    sma_20 DECIMAL(10,3),
    sma_50 DECIMAL(10,3),
    ema_12 DECIMAL(10,3),
    ema_26 DECIMAL(10,3),
    rsi DECIMAL(5,2),
    macd DECIMAL(10,4),
    macd_signal DECIMAL(10,4),
    bollinger_upper DECIMAL(10,3),
    bollinger_middle DECIMAL(10,3),
    bollinger_lower DECIMAL(10,3),
    created_at DATETIME2
)

-- 💎 Opportunities Table
Opportunities (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    stock_id INT FOREIGN KEY REFERENCES Stocks(id),
    opportunity_type NVARCHAR(50),
    score DECIMAL(5,2),
    confidence_level NVARCHAR(20),
    entry_price DECIMAL(10,3),
    target_price DECIMAL(10,3),
    stop_loss DECIMAL(10,3),
    risk_reward_ratio DECIMAL(5,2),
    description NVARCHAR(MAX),
    is_active BIT DEFAULT 1,
    created_at DATETIME2,
    expires_at DATETIME2
)

-- 📁 Portfolios Table
Portfolios (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(id),
    name NVARCHAR(100),
    description NVARCHAR(500),
    initial_capital DECIMAL(18,2),
    current_value DECIMAL(18,2),
    total_return DECIMAL(10,4),
    risk_level NVARCHAR(20),
    created_at DATETIME2,
    updated_at DATETIME2
)

-- 💼 Portfolio Positions Table
PortfolioPositions (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    portfolio_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Portfolios(id),
    stock_id INT FOREIGN KEY REFERENCES Stocks(id),
    position_type NVARCHAR(10), -- 'BUY', 'SELL'
    quantity INT,
    entry_price DECIMAL(10,3),
    entry_date DATETIME2,
    exit_price DECIMAL(10,3),
    exit_date DATETIME2,
    stop_loss DECIMAL(10,3),
    target_price DECIMAL(10,3),
    status NVARCHAR(20), -- 'OPEN', 'CLOSED', 'PENDING'
    pnl DECIMAL(18,2),
    created_at DATETIME2
)

-- 🔔 Alerts Table
Alerts (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(id),
    stock_id INT FOREIGN KEY REFERENCES Stocks(id),
    alert_type NVARCHAR(50),
    condition_type NVARCHAR(50), -- 'PRICE_ABOVE', 'PRICE_BELOW', 'RSI_OVERBOUGHT'
    condition_value DECIMAL(10,3),
    message NVARCHAR(500),
    is_triggered BIT DEFAULT 0,
    is_active BIT DEFAULT 1,
    created_at DATETIME2,
    triggered_at DATETIME2
)
```

### ⚙️ **Configuration Files**

```
config/
├── environment.js             # 🌍 إدارة البيئات الرئيسية
│   ├── Environment detection  # اكتشاف البيئة الحالية
│   ├── Config loading        # تحميل الإعدادات
│   └── Fallback handling     # التعامل مع الأخطاء
│
├── environments/              # 📁 إعدادات البيئات
│   ├── development.js        # 🔧 بيئة التطوير
│   │   ├── Database config   # إعدادات قاعدة البيانات
│   │   ├── Redis config      # إعدادات Redis
│   │   ├── JWT settings      # إعدادات JWT
│   │   ├── Server settings   # إعدادات الخادم
│   │   └── Logging config    # إعدادات التسجيل
│   │
│   ├── test.js              # 🧪 بيئة الاختبار
│   │   ├── Test database     # قاعدة بيانات الاختبار
│   │   ├── Mock services     # خدمات وهمية
│   │   ├── Fast JWT          # JWT سريع للاختبار
│   │   └── Minimal logging   # تسجيل محدود
│   │
│   └── production.js         # 🚀 بيئة الإنتاج
│       ├── Production DB     # قاعدة البيانات الإنتاجية
│       ├── Redis cluster     # مجموعة Redis
│       ├── Secure JWT        # JWT آمن
│       ├── SSL configuration # إعدادات SSL
│       ├── Performance tuning # تحسين الأداء
│       └── Security hardening # تقوية الأمان
│
├── database.js               # 🗄️ إعدادات قاعدة البيانات
│   ├── Connection pooling    # تجميع الاتصالات
│   ├── Query optimization    # تحسين الاستعلامات
│   ├── Error handling        # معالجة أخطاء قاعدة البيانات
│   ├── Health checks         # فحوصات الصحة
│   └── Migration support     # دعم الترحيل
│
└── redis.js                  # 🔴 إعدادات Redis
    ├── Connection management # إدارة الاتصال
    ├── Cache strategies      # استراتيجيات التخزين المؤقت
    ├── Session storage       # تخزين الجلسات
    ├── Pub/Sub messaging     # نظام الرسائل
    └── Performance monitoring # مراقبة الأداء
```

### 🐳 **Docker Configuration**

```
docker/
├── Dockerfile                # 🐳 تعريف الحاوية الرئيسية
│   ├── Multi-stage build     # بناء متعدد المراحل
│   ├── Node.js optimization  # تحسين Node.js
│   ├── Security hardening    # تقوية الأمان
│   ├── Health checks         # فحوصات الصحة
│   └── Signal handling       # معالجة الإشارات
│
├── docker-compose.yml        # 🎼 تكوين الإنتاج
│   ├── Application service   # خدمة التطبيق
│   ├── Redis service         # خدمة Redis
│   ├── Network configuration # تكوين الشبكة
│   ├── Volume mapping        # ربط الأحجام
│   ├── Environment variables # متغيرات البيئة
│   └── Health checks         # فحوصات الصحة
│
├── docker-compose.test.yml   # 🧪 تكوين الاختبار
│   ├── Test database         # قاعدة بيانات الاختبار
│   ├── Test Redis            # Redis للاختبار
│   ├── Test environment      # بيئة الاختبار
│   └── Mock services         # خدمات وهمية
│
└── README.md                 # 📖 دليل Docker
    ├── Usage instructions    # تعليمات الاستخدام
    ├── Development setup     # إعداد التطوير
    ├── Production deployment # نشر الإنتاج
    └── Troubleshooting       # حل المشاكل
```

### 📜 **Scripts Directory**

```
scripts/
├── init-database.js          # 🏗️ تهيئة قاعدة البيانات
│   ├── Create database       # إنشاء قاعدة البيانات
│   ├── Create tables         # إنشاء الجداول
│   ├── Create indexes        # إنشاء الفهارس
│   ├── Insert initial data   # إدراج البيانات الأولية
│   └── Verify setup          # التحقق من الإعداد
│
├── create-db.js              # 🆕 إنشاء قاعدة البيانات
│   ├── Database existence check # فحص وجود قاعدة البيانات
│   ├── Create if not exists  # إنشاء إذا لم تكن موجودة
│   └── Set permissions       # تعيين الصلاحيات
│
├── populate-data.js          # 📊 ملء البيانات
│   ├── Egyptian stocks data  # بيانات الأسهم المصرية
│   ├── Historical prices     # الأسعار التاريخية
│   ├── Sample users          # مستخدمين عينة
│   ├── Test portfolios       # محافظ تجريبية
│   └── Data validation       # التحقق من البيانات
│
├── quick-start.sh           # ⚡ البدء السريع
│   ├── Environment check     # فحص البيئة
│   ├── Dependencies install  # تثبيت التبعيات
│   ├── Database setup        # إعداد قاعدة البيانات
│   ├── Redis start           # تشغيل Redis
│   ├── Application start     # تشغيل التطبيق
│   └── Health verification   # التحقق من الصحة
│
├── deploy.sh                # 🚀 نشر الإنتاج
│   ├── Pre-deployment checks # فحوصات ما قبل النشر
│   ├── Build application     # بناء التطبيق
│   ├── Database migration    # ترحيل قاعدة البيانات
│   ├── Service deployment    # نشر الخدمات
│   ├── Health monitoring     # مراقبة الصحة
│   └── Rollback capability   # إمكانية التراجع
│
├── backup.sh                # 💾 النسخ الاحتياطي
│   ├── Database backup       # نسخ احتياطي لقاعدة البيانات
│   ├── Redis backup          # نسخ احتياطي لـ Redis
│   ├── Configuration backup  # نسخ احتياطي للإعدادات
│   ├── Logs backup           # نسخ احتياطي للسجلات
│   ├── Compression           # ضغط الملفات
│   └── Upload to cloud       # رفع للسحابة
│
├── health-check.sh          # 🏥 فحص الصحة
│   ├── Application health    # صحة التطبيق
│   ├── Database connectivity # اتصال قاعدة البيانات
│   ├── Redis connectivity    # اتصال Redis
│   ├── API endpoints test    # اختبار نقاط API
│   ├── Performance metrics   # مقاييس الأداء
│   └── Alert system          # نظام التنبيهات
│
├── init-db.sh              # 🔧 تهيئة قاعدة البيانات (Shell)
│   ├── Environment setup     # إعداد البيئة
│   ├── SQL Server check      # فحص SQL Server
│   ├── Database creation     # إنشاء قاعدة البيانات
│   ├── Schema migration      # ترحيل المخطط
│   └── Initial data seed     # بذر البيانات الأولية
│
└── README.md                # 📚 دليل Scripts
    ├── Script descriptions   # وصف Scripts
    ├── Usage examples        # أمثلة الاستخدام
    ├── Prerequisites         # المتطلبات المسبقة
    └── Troubleshooting       # حل المشاكل
```

## 🚀 طريقة التشغيل والاستخدام

### 1. **التشغيل للمرة الأولى**

#### **أ. الإعداد السريع (موصى به)**
```bash
# 1. استنساخ المشروع
git clone https://github.com/your-username/EGXpilot.git
cd EGXpilot

# 2. تشغيل البدء السريع
chmod +x scripts/quick-start.sh
./scripts/quick-start.sh
```

#### **ب. الإعداد اليدوي**
```bash
# 1. تثبيت التبعيات
npm install

# 2. إعداد البيئة
cp .env.example .env
# تحرير .env وإضافة بيانات قاعدة البيانات

# 3. تهيئة قاعدة البيانات
npm run init-db

# 4. تشغيل Redis
docker run -d --name egx-redis -p 6379:6379 redis:7

# 5. تشغيل التطبيق
npm run dev
```

### 2. **أوامر التشغيل المختلفة**

```bash
# 🔧 التطوير
npm run dev              # تشغيل مع nodemon (إعادة تشغيل تلقائي)
npm run start:dev        # تشغيل بيئة التطوير

# 🚀 الإنتاج
npm run start           # تشغيل الإنتاج
npm run start:prod      # تشغيل صريح للإنتاج

# 🧪 الاختبار
npm test               # تشغيل جميع الاختبارات
npm run test:unit      # اختبارات الوحدة
npm run test:integration # اختبارات التكامل
npm run test:e2e       # اختبارات شاملة
npm run test:coverage  # تقرير التغطية

# 🗄️ قاعدة البيانات
npm run init-db        # تهيئة قاعدة البيانات
npm run migrate        # تشغيل الترحيلات
npm run seed           # ملء البيانات الأولية

# 🧹 التنظيف والصيانة
npm run clean          # تنظيف الملفات المؤقتة
npm run clean:logs     # تنظيف ملفات السجلات
npm run lint           # فحص جودة الكود
npm run lint:fix       # إصلاح مشاكل الكود تلقائياً
npm run format         # تنسيق الكود

# 🏥 المراقبة والصحة
npm run health-check   # فحص صحة النظام
npm run monitor        # مراقبة مستمرة
npm run logs           # عرض السجلات
npm run logs:error     # عرض سجلات الأخطاء

# 📦 البناء والنشر
npm run build          # بناء التطبيق
npm run deploy         # نشر الإنتاج
npm run backup         # نسخ احتياطي
```

### 3. **استخدام API**

#### **أ. المصادقة**
```bash
# تسجيل مستخدم جديد
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "investor@example.com",
    "password": "SecurePass123!",
    "firstName": "أحمد",
    "lastName": "محمد"
  }'

# تسجيل الدخول
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "investor@example.com",
    "password": "SecurePass123!"
  }'
```

#### **ب. الحصول على بيانات الأسهم**
```bash
# قائمة جميع الأسهم
curl http://localhost:5000/api/stocks

# تفاصيل سهم معين
curl http://localhost:5000/api/stocks/HRHO.CA

# البيانات التاريخية
curl http://localhost:5000/api/stocks/HRHO.CA/history?days=30

# البيانات الحية
curl http://localhost:5000/api/stocks/HRHO.CA/realtime
```

#### **ج. التحليل الفني**
```bash
# المؤشرات الفنية
curl http://localhost:5000/api/analysis/HRHO.CA/indicators

# إشارات التداول
curl http://localhost:5000/api/analysis/HRHO.CA/signals

# تحليل مخصص
curl -X POST http://localhost:5000/api/analysis/HRHO.CA/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "indicators": ["RSI", "MACD", "BOLLINGER"],
    "timeframe": "1D",
    "period": 30
  }'
```

#### **د. الفرص الاستثمارية**
```bash
# أحدث الفرص
curl http://localhost:5000/api/opportunities/latest

# تشغيل مسح جديد
curl -X POST http://localhost:5000/api/opportunities/scan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# أداء التوصيات
curl http://localhost:5000/api/opportunities/performance
```

#### **ه. إدارة المحافظ**
```bash
# إنشاء محفظة جديدة
curl -X POST http://localhost:5000/api/portfolios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "محفظة النمو",
    "description": "محفظة للاستثمار طويل المدى",
    "initialCapital": 100000,
    "riskLevel": "MODERATE"
  }'

# إضافة صفقة
curl -X POST http://localhost:5000/api/portfolios/PORTFOLIO_ID/positions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "stockSymbol": "HRHO.CA",
    "positionType": "BUY",
    "quantity": 100,
    "entryPrice": 15.25,
    "stopLoss": 14.00,
    "targetPrice": 18.00
  }'

# أداء المحفظة
curl http://localhost:5000/api/portfolios/PORTFOLIO_ID/performance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. **استخدام WebSocket للتحديثات الحية**

```javascript
// الاتصال بـ WebSocket
const socket = io('http://localhost:5000');

// الاشتراك في تحديثات سهم معين
socket.emit('subscribe_stock', 'HRHO.CA');

// استقبال تحديثات الأسعار
socket.on('price_update', (data) => {
  console.log('تحديث السعر:', data);
  // {
  //   symbol: 'HRHO.CA',
  //   price: 15.30,
  //   change: +0.15,
  //   changePercent: +0.99,
  //   volume: 125000,
  //   timestamp: '2025-06-18T10:30:00Z'
  // }
});

// استقبال تنبيهات الفرص
socket.on('new_opportunity', (opportunity) => {
  console.log('فرصة جديدة:', opportunity);
  // {
  //   symbol: 'EIDB.CA',
  //   score: 0.87,
  //   recommendation: 'STRONG_BUY',
  //   entryPrice: 12.45,
  //   targetPrice: 15.20,
  //   stopLoss: 11.80
  // }
});

// إنهاء الاشتراك
socket.emit('unsubscribe_stock', 'HRHO.CA');
```

## 🧪 نظام الاختبارات

### 1. **هيكل الاختبارات**

```
tests/
├── setup.js                 # 🔧 إعداد الاختبارات
│   ├── Test environment     # إعداد بيئة الاختبار
│   ├── Mock services        # خدمات وهمية
│   ├── Database setup       # إعداد قاعدة البيانات
│   └── Global teardown      # تنظيف عام
│
├── unit/                    # 🔬 اختبارات الوحدة
│   ├── models/             # اختبار النماذج
│   │   ├── User.test.js    # اختبار نموذج المستخدم
│   │   ├── Stock.test.js   # اختبار نموذج الأسهم
│   │   └── Portfolio.test.js # اختبار نموذج المحفظة
│   │
│   ├── services/           # اختبار الخدمات
│   │   ├── technicalAnalysis.test.js # اختبار التحليل الفني
│   │   ├── opportunityHunter.test.js # اختبار محرك الفرص
│   │   ├── dataCollector.test.js     # اختبار جمع البيانات
│   │   └── portfolioService.test.js  # اختبار خدمة المحافظ
│   │
│   └── utils/              # اختبار الأدوات
│       ├── logger.test.js  # اختبار نظام التسجيل
│       ├── helpers.test.js # اختبار الدوال المساعدة
│       └── validation.test.js # اختبار التحقق
│
├── integration/            # 🔗 اختبارات التكامل
│   ├── api/               # اختبار API
│   │   ├── auth.test.js   # اختبار المصادقة
│   │   ├── stocks.test.js # اختبار API الأسهم
│   │   ├── analysis.test.js # اختبار API التحليل
│   │   ├── opportunities.test.js # اختبار API الفرص
│   │   └── portfolios.test.js # اختبار API المحافظ
│   │
│   ├── database/          # اختبار قاعدة البيانات
│   │   ├── connection.test.js # اختبار الاتصال
│   │   ├── queries.test.js    # اختبار الاستعلامات
│   │   └── migrations.test.js # اختبار الترحيلات
│   │
│   └── external/          # اختبار الخدمات الخارجية
│       ├── yahooFinance.test.js # اختبار Yahoo Finance
│       └── notifications.test.js # اختبار التنبيهات
│
├── e2e/                   # 🎭 اختبارات شاملة
│   ├── userJourney.test.js # رحلة المستخدم الكاملة
│   ├── tradingFlow.test.js # تدفق التداول
│   ├── portfolioManagement.test.js # إدارة المحفظة
│   └── opportunityScanning.test.js # مسح الفرص
│
├── manual/                # 🖐️ اختبارات يدوية
│   ├── quick-test.js      # اختبار سريع
│   ├── simple-test.js     # اختبار بسيط
│   ├── test-connection.js # اختبار الاتصال
│   ├── test-db-connection.js # اختبار قاعدة البيانات
│   └── test-direct.js     # اختبار مباشر
│
└── performance/           # ⚡ اختبارات الأداء
    ├── load.test.js       # اختبار الحمولة
    ├── stress.test.js     # اختبار الضغط
    └── benchmark.test.js  # اختبار المعايير
```

### 2. **تشغيل الاختبارات**

```bash
# تشغيل جميع الاختبارات
npm test

# اختبارات الوحدة فقط
npm run test:unit

# اختبارات التكامل فقط
npm run test:integration

# اختبارات شاملة فقط
npm run test:e2e

# اختبار مع تقرير التغطية
npm run test:coverage

# اختبار مستمر أثناء التطوير
npm run test:watch

# اختبار ملف معين
npm test -- --testNamePattern="User model"

# اختبار مع مزيد من التفاصيل
npm test -- --verbose

# اختبار الأداء
npm run test:performance
```

### 3. **أمثلة الاختبارات**

#### **اختبار وحدة - حساب RSI**
```javascript
// tests/unit/services/technicalAnalysis.test.js
const TechnicalAnalysisService = require('../../../backend/services/technicalAnalysisService');

describe('Technical Analysis Service', () => {
  let service;

  beforeEach(() => {
    service = new TechnicalAnalysisService();
  });

  describe('calculateRSI', () => {
    test('should calculate RSI correctly for given prices', () => {
      const prices = [44, 44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.85, 46.08, 45.89, 46.03, 46.83, 47.69, 46.49, 46.26];
      const rsi = service.calculateRSI(prices, 14);
      
      expect(rsi).toHaveLength(1);
      expect(rsi[0]).toBeCloseTo(70.53, 1);
    });

    test('should handle edge cases', () => {
      const prices = [10, 10, 10, 10, 10];
      const rsi = service.calculateRSI(prices, 4);
      
      expect(rsi[0]).toBe(50); // No change should result in RSI of 50
    });
  });
});
```

#### **اختبار تكامل - API المصادقة**
```javascript
// tests/integration/api/auth.test.js
const request = require('supertest');
const app = require('../../../backend/server');

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'أحمد',
        lastName: 'محمد'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.token).toBeDefined();
    });

    test('should not register user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('البريد الإلكتروني غير صالح');
    });
  });
});
```

#### **اختبار شامل - رحلة المستخدم**
```javascript
// tests/e2e/userJourney.test.js
describe('Complete User Journey', () => {
  test('user can register, login, create portfolio, and get recommendations', async () => {
    // 1. تسجيل مستخدم جديد
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'investor@example.com',
        password: 'SecurePass123!',
        firstName: 'أحمد',
        lastName: 'المستثمر'
      });

    expect(registerResponse.status).toBe(201);
    const token = registerResponse.body.token;

    // 2. إنشاء محفظة جديدة
    const portfolioResponse = await request(app)
      .post('/api/portfolios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'محفظة النمو',
        initialCapital: 100000,
        riskLevel: 'MODERATE'
      });

    expect(portfolioResponse.status).toBe(201);
    const portfolioId = portfolioResponse.body.portfolio.id;

    // 3. إضافة صفقة
    const positionResponse = await request(app)
      .post(`/api/portfolios/${portfolioId}/positions`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        stockSymbol: 'HRHO.CA',
        positionType: 'BUY',
        quantity: 100,
        entryPrice: 15.25
      });

    expect(positionResponse.status).toBe(201);

    // 4. الحصول على توصيات
    const opportunitiesResponse = await request(app)
      .get('/api/opportunities/latest')
      .set('Authorization', `Bearer ${token}`);

    expect(opportunitiesResponse.status).toBe(200);
    expect(opportunitiesResponse.body.opportunities).toBeDefined();
  });
});
```

## 📊 مراقبة الأداء والسجلات

### 1. **نظام التسجيل (Logging)**

```javascript
// backend/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'egxpilot' },
  transports: [
    // كتابة جميع السجلات مع مستوى 'error' وأدناه إلى error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // كتابة جميع السجلات مع مستوى 'info' وأدناه إلى combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ]
});

// في بيئة التطوير، اطبع السجلات إلى وحدة التحكم
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### 2. **مراقبة الصحة (Health Monitoring)**

```javascript
// Health Check Endpoint
app.get('/health/detailed', async (req, res) => {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {},
    system: {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version
    }
  };

  try {
    // فحص قاعدة البيانات
    const dbHealth = await testDatabaseConnection();
    checks.services.database = dbHealth;

    // فحص Redis
    const redisHealth = await testRedisConnection();
    checks.services.redis = redisHealth;

    // فحص الخدمات الخارجية
    const yahooHealth = await testYahooFinanceAPI();
    checks.services.yahooFinance = yahooHealth;

    // تحديد الحالة العامة
    const unhealthyServices = Object.values(checks.services)
      .filter(service => service.status !== 'healthy');
    
    if (unhealthyServices.length > 0) {
      checks.status = 'unhealthy';
    }

    const statusCode = checks.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(checks);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### 3. **مقاييس الأداء (Performance Metrics)**

```javascript
// Middleware لقياس أداء API
const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const method = req.method;
    const route = req.route ? req.route.path : req.path;
    const statusCode = res.statusCode;
    
    logger.info('API Performance', {
      method,
      route,
      statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    // إرسال المقاييس إلى نظام المراقبة
    if (duration > 1000) { // أبطأ من ثانية واحدة
      logger.warn('Slow API Response', {
        method,
        route,
        duration: `${duration}ms`
      });
    }
  });
  
  next();
};

app.use(performanceMiddleware);
```

## 🔒 الأمان والحماية

### 1. **مصادقة JWT**
```javascript
// إنشاء رمز مميز
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'EGXpilot',
    audience: 'EGXpilot-users'
  });
};

// التحقق من الرمز المميز
const verifyToken = async (token) => {
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
```

### 2. **تحديد معدل الطلبات (Rate Limiting)**
```javascript
const rateLimit = require('express-rate-limit');

// تحديد عام للAPI
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب لكل IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
    messageArabic: 'طلبات كثيرة جداً من هذا العنوان، يرجى المحاولة لاحقاً'
  }
});

// تحديد صارم للمصادقة
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // حد أقصى 5 محاولات تسجيل دخول
  skipSuccessfulRequests: true
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
```

### 3. **التحقق من البيانات**
```javascript
const { body, validationResult } = require('express-validator');

// قواعد التحقق من تسجيل المستخدم
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('كلمة المرور يجب أن تكون على الأقل 8 أحرف')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('كلمة المرور يجب أن تحتوي على حروف كبيرة وصغيرة وأرقام ورموز خاصة'),
  
  body('firstName')
    .notEmpty()
    .withMessage('الاسم الأول مطلوب')
    .isLength({ max: 50 })
    .withMessage('الاسم الأول طويل جداً'),
  
  body('lastName')
    .notEmpty()
    .withMessage('الاسم الأخير مطلوب')
    .isLength({ max: 50 })
    .withMessage('الاسم الأخير طويل جداً')
];

// معالج أخطاء التحقق
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => err.msg)
    });
  }
  next();
};
```

## 🚀 نشر الإنتاج (Production Deployment)

### 1. **Docker Deployment**
```bash
# بناء ونشر باستخدام Docker Compose
docker-compose up -d

# مراقبة السجلات
docker-compose logs -f egxpilot-app

# إعادة تشغيل الخدمات
docker-compose restart

# تحديث التطبيق
docker-compose pull
docker-compose up -d --no-deps egxpilot-app
```

### 2. **Manual Deployment**
```bash
# نشر يدوي باستخدام script
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# أو باستخدام npm
npm run deploy:full
```

### 3. **Health Monitoring في الإنتاج**
```bash
# فحص مستمر للصحة
watch -n 30 'curl -s http://localhost:5000/health/detailed | jq .status'

# مراقبة السجلات
tail -f logs/combined.log | grep ERROR

# مراقبة الأداء
npm run monitor
```

هذا الدليل الشامل يغطي جميع جوانب المشروع من آلية العمل إلى التشغيل والاختبار والنشر. كل قسم مفصل ويتضمن أمثلة عملية للاستخدام.

## 🔧 إدارة البيئات والإعدادات

### 1. **ملفات البيئة (.env)**

#### **.env (التطوير)**
```bash
# البيئة
NODE_ENV=development
PORT=5000

# قاعدة البيانات
DB_HOST=localhost
DB_PORT=1433
DB_NAME=egxpilot_dev
DB_USER=sa
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=24h

# التطبيق
FRONTEND_URL=http://localhost:3000
API_RATE_LIMIT=100
API_RATE_WINDOW=15

# التخزين المؤقت
CACHE_REALTIME_TTL=60
CACHE_TECHNICAL_TTL=300
CACHE_HISTORICAL_TTL=86400

# محرك الفرص
OH_SCAN_INTERVAL=300000
OH_MIN_SCORE=0.65
OH_MAX_OPPORTUNITIES=50
OH_MIN_VOLUME=100000

# البريد الإلكتروني
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# السجلات
LOG_LEVEL=info
LOG_FILE=logs/app.log

# مصادر البيانات
YAHOO_FINANCE_API=true
ALPHA_VANTAGE_KEY=your_alpha_vantage_key
```

#### **.env.production (الإنتاج)**
```bash
# البيئة
NODE_ENV=production
PORT=5000

# الخادم
HOST=0.0.0.0
DOMAIN=egxpilot.com
SERVER_IP=41.38.217.73

# قاعدة البيانات (محسنة للإنتاج)
DB_HOST=sqlserver
DB_PORT=1433
DB_NAME=egxpilot
DB_USER=egxpilot_user
DB_PASSWORD=complex_production_password

# Redis (محسن للإنتاج)
REDIS_HOST=41.38.217.73
REDIS_PORT=6379
REDIS_PASSWORD=redis_production_password
REDIS_DB=0

# الأمان (محسن)
JWT_SECRET=very-complex-production-jwt-secret-with-at-least-64-characters
JWT_EXPIRES_IN=24h
JWT_ISSUER=egxpilot.com
JWT_AUDIENCE=egxpilot-users

# CORS
CORS_ORIGIN=https://egxpilot.com

# معدل الطلبات (محسن للإنتاج)
API_RATE_LIMIT=500
API_RATE_WINDOW=15

# SSL
SSL_CERT_PATH=/etc/ssl/certs/egxpilot.crt
SSL_KEY_PATH=/etc/ssl/private/egxpilot.key

# Helmet CSP
HELMET_CSP_ENABLED=true

# السجلات (محسنة للإنتاج)
LOG_LEVEL=warn
LOG_FILE=/var/log/egxpilot/app.log

# أداء محسن
OH_SCAN_INTERVAL=180000
OH_MAX_OPPORTUNITIES=100
OH_MIN_VOLUME=1000000

# التخزين المؤقت (محسن)
CACHE_REALTIME_TTL=30
CACHE_TECHNICAL_TTL=180
CACHE_HISTORICAL_TTL=43200
```

#### **.env.test (الاختبار)**
```bash
# البيئة
NODE_ENV=test
PORT=5001

# قاعدة البيانات (اختبار)
DB_HOST=localhost
DB_PORT=1433
DB_NAME=egxpilot_test
DB_USER=sa
DB_PASSWORD=test_password

# Redis (اختبار)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=15

# JWT (اختبار - أقل تعقيداً)
JWT_SECRET=test-secret-key-for-testing-only
JWT_EXPIRES_IN=1h

# إعدادات الاختبار
LOG_LEVEL=error
API_RATE_LIMIT=1000
CACHE_REALTIME_TTL=5
OH_SCAN_INTERVAL=60000
```

### 2. **إدارة الإعدادات المتقدمة**

#### **تحميل الإعدادات ديناميكياً**
```javascript
// config/environment.js
require('dotenv').config();

const environment = process.env.NODE_ENV || 'development';

let config;
try {
  config = require(`./environments/${environment}`);
  console.log(`✅ Loaded ${environment} configuration`);
} catch (error) {
  console.warn(`⚠️ Environment config for '${environment}' not found, falling back to development`);
  config = require('./environments/development');
}

// إضافة إعدادات عامة
config.app = {
  name: 'EGXpilot',
  version: process.env.npm_package_version || '1.0.0',
  environment: environment,
  startTime: new Date().toISOString()
};

module.exports = config;
```

#### **التحقق من الإعدادات المطلوبة**
```javascript
// config/validation.js
const requiredEnvVars = {
  development: [
    'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
    'JWT_SECRET'
  ],
  production: [
    'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
    'JWT_SECRET', 'REDIS_HOST', 'REDIS_PASSWORD',
    'DOMAIN', 'SSL_CERT_PATH', 'SSL_KEY_PATH'
  ],
  test: [
    'DB_HOST', 'DB_USER', 'DB_PASSWORD',
    'JWT_SECRET'
  ]
};

function validateEnvironment(env = process.env.NODE_ENV || 'development') {
  const required = requiredEnvVars[env] || [];
  const missing = required.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log(`✅ All required environment variables are set for ${env}`);
  return true;
}

module.exports = { validateEnvironment };
```

## 🚀 دليل التشغيل المتقدم

### 1. **خيارات التشغيل المختلفة**

#### **أ. التطوير مع Hot Reload**
```bash
# تشغيل مع إعادة تحميل تلقائي
npm run dev

# تشغيل مع تصحيح الأخطاء
npm run dev:debug

# تشغيل مع مراقبة الأداء
npm run dev:profile
```

#### **ب. الإنتاج**
```bash
# تشغيل عادي
npm start

# تشغيل مع PM2 (موصى به للإنتاج)
pm2 start ecosystem.config.js

# تشغيل مع Docker
docker-compose up -d

# تشغيل كخدمة نظام
sudo systemctl start egxpilot
```

#### **ج. التشغيل المتقدم**
```bash
# تشغيل مع متغيرات بيئة مخصصة
NODE_ENV=production LOG_LEVEL=debug npm start

# تشغيل مع ملف بيئة مخصص
npm start -- --env-file=.env.custom

# تشغيل مع تحديد المنفذ
PORT=8080 npm start

# تشغيل مع عدة عمال
WORKERS=4 npm start
```

### 2. **إدارة العمليات (Process Management)**

#### **PM2 Configuration**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'egxpilot',
    script: './backend/server.js',
    instances: 'max', // استخدام جميع المعالجات المتاحة
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=4096',
    watch: false,
    ignore_watch: ["node_modules", "logs", "temp"],
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

#### **Systemd Service**
```ini
# /etc/systemd/system/egxpilot.service
[Unit]
Description=EGXpilot - Smart Financial Advisor
After=network.target

[Service]
Type=simple
User=egxpilot
WorkingDirectory=/opt/egxpilot
Environment=NODE_ENV=production
ExecStart=/usr/bin/node backend/server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=egxpilot

[Install]
WantedBy=multi-user.target
```

### 3. **مراقبة النظام (System Monitoring)**

#### **فحص الصحة المتقدم**
```bash
#!/bin/bash
# scripts/health-check.sh

echo "🏥 EGXpilot Health Check"
echo "========================"

# فحص العمليات
if pgrep -f "node.*server.js" > /dev/null; then
    echo "✅ Application is running"
else
    echo "❌ Application is not running"
    exit 1
fi

# فحص المنفذ
if netstat -tuln | grep ":5000 " > /dev/null; then
    echo "✅ Port 5000 is listening"
else
    echo "❌ Port 5000 is not listening"
    exit 1
fi

# فحص قاعدة البيانات
if curl -s http://localhost:5000/health/detailed | jq -e '.services.database.status == "healthy"' > /dev/null; then
    echo "✅ Database is healthy"
else
    echo "❌ Database is unhealthy"
    exit 1
fi

# فحص Redis
if curl -s http://localhost:5000/health/detailed | jq -e '.services.redis.status == "healthy"' > /dev/null; then
    echo "✅ Redis is healthy"
else
    echo "⚠️ Redis is not available (optional service)"
fi

# فحص استخدام الذاكرة
MEMORY_USAGE=$(ps -o pid,ppid,pcpu,pmem,comm -p $(pgrep -f "node.*server.js") | tail -n +2 | awk '{print $4}')
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "⚠️ High memory usage: ${MEMORY_USAGE}%"
else
    echo "✅ Memory usage: ${MEMORY_USAGE}%"
fi

# فحص مساحة القرص
DISK_USAGE=$(df -h / | tail -n +2 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "⚠️ High disk usage: ${DISK_USAGE}%"
else
    echo "✅ Disk usage: ${DISK_USAGE}%"
fi

echo "🎉 Health check completed successfully"
```

#### **مراقبة الأداء**
```bash
#!/bin/bash
# scripts/performance-monitor.sh

echo "📊 EGXpilot Performance Monitor"
echo "==============================="

# مراقبة API response times
echo "🔍 API Response Times (last 100 requests):"
tail -n 100 logs/combined.log | grep "API Performance" | \
jq -r '.duration' | sed 's/ms//' | \
awk '{ sum += $1; count++ } END { 
  if (count > 0) 
    printf "Average: %.2fms, Requests: %d\n", sum/count, count 
  else 
    print "No recent API requests found"
}'

# مراقبة الأخطاء
echo -e "\n🚨 Recent Errors (last 10):"
tail -n 1000 logs/error.log | tail -n 10 | jq -r '.timestamp + " " + .message'

# مراقبة استخدام الموارد
echo -e "\n💻 System Resources:"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')"
echo "Memory Usage: $(free -h | grep '^Mem:' | awk '{printf "%.1f%%", ($3/$2)*100}')"
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"

# مراقبة قاعدة البيانات
echo -e "\n🗄️ Database Performance:"
ACTIVE_CONNECTIONS=$(curl -s http://localhost:5000/health/detailed | jq -r '.services.database.activeConnections // "N/A"')
echo "Active DB Connections: $ACTIVE_CONNECTIONS"

# مراقبة Redis
echo -e "\n🔴 Redis Performance:"
REDIS_MEMORY=$(curl -s http://localhost:5000/health/detailed | jq -r '.services.redis.memoryUsage // "N/A"')
echo "Redis Memory Usage: $REDIS_MEMORY"
```

## 🔒 الأمان والحماية

### 1. **مصادقة JWT**
```javascript
// إنشاء رمز مميز
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'EGXpilot',
    audience: 'EGXpilot-users'
  });
};

// التحقق من الرمز المميز
const verifyToken = async (token) => {
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
```

### 2. **تحديد معدل الطلبات (Rate Limiting)**
```javascript
const rateLimit = require('express-rate-limit');

// تحديد عام للAPI
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب لكل IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
    messageArabic: 'طلبات كثيرة جداً من هذا العنوان، يرجى المحاولة لاحقاً'
  }
});

// تحديد صارم للمصادقة
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // حد أقصى 5 محاولات تسجيل دخول
  skipSuccessfulRequests: true
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
```

### 3. **التحقق من البيانات**
```javascript
const { body, validationResult } = require('express-validator');

// قواعد التحقق من تسجيل المستخدم
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('كلمة المرور يجب أن تكون على الأقل 8 أحرف')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('كلمة المرور يجب أن تحتوي على حروف كبيرة وصغيرة وأرقام ورموز خاصة'),
  
  body('firstName')
    .notEmpty()
    .withMessage('الاسم الأول مطلوب')
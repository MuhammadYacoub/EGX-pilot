# EGXPILOT - Smart Financial Advisor for the Egyptian Stock Market

<div align="center">
  <h1>🇪🇬 EGXpilot</h1>
  <p><strong>نظام ذكي للتحليل الفني والتوصيات الاستثمارية في البورصة المصرية</strong></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
  [![Redis](https://img.shields.io/badge/Redis-7+-red.svg)](https://redis.io/)
  [![SQL Server](https://img.shields.io/badge/SQL%20Server-2019+-orange.svg)](https://www.microsoft.com/en-us/sql-server/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- SQL Server 2019+ (or Express edition)
- Redis 6+ (optional for development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/EGXpilot.git
cd EGXpilot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Initialize database**
```bash
npm run init-db
```

5. **Start the development server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📊 Implementation Status

### ✅ **Completed Components**

#### **Backend Infrastructure**
- [x] Express.js server with security middleware
- [x] SQL Server database integration with connection pooling
- [x] Redis caching layer with TTL management
- [x] Comprehensive logging system (Winston)
- [x] Rate limiting and CORS configuration
- [x] Environment-based configuration management

#### **Database Layer**
- [x] Complete SQL Server schema with 12+ tables
- [x] User authentication and session management
- [x] Portfolio tracking with transactions
- [x] Stock data storage (OHLCV + metadata)
- [x] Technical analysis results storage
- [x] Market opportunities tracking
- [x] Stored procedures for common operations
- [x] Database indexes for performance optimization

#### **Authentication System**
- [x] JWT-based authentication with refresh tokens
- [x] User registration and login with validation
- [x] Session management with device tracking
- [x] Password hashing with bcrypt
- [x] Role-based access control (USER, ADMIN, PREMIUM)
- [x] Subscription-based feature gating

#### **Data Models**
- [x] User model with subscription features
- [x] Stock model with technical analysis integration
- [x] Portfolio model with transaction management
- [x] Advanced portfolio statistics and performance tracking

#### **Market Data & Analysis**
- [x] Yahoo Finance data collector with rate limiting
- [x] Advanced momentum indicators (RSI, MACD, Stochastic)
- [x] Divergence detection algorithms
- [x] Volume analysis and price action signals
- [x] 50+ Egyptian stocks database (EGX 30 + popular stocks)

#### **Opportunity Hunter System**
- [x] Sophisticated market scanner engine
- [x] Multi-signal analysis with weighted scoring
- [x] Real-time opportunity ranking
- [x] Automated market scanning with configurable intervals
- [x] Arabic language support for analysis

#### **API Endpoints**
- [x] Authentication routes (/api/auth)
- [x] Stock data routes (/api/stocks)
- [x] Technical analysis routes (/api/analysis)
- [x] Market opportunities routes (/api/opportunities)
- [x] Portfolio management routes (/api/portfolios)
- [x] Comprehensive error handling and validation

### 🔄 **In Progress**
- [ ] WebSocket implementation for real-time updates
- [ ] Advanced pattern recognition (Candlestick & Chart patterns)
- [ ] Alert system with email/SMS notifications
- [ ] Portfolio performance analytics dashboard

### 📋 **Pending Implementation**
- [ ] React frontend application
- [ ] Backtesting engine for strategy validation
- [ ] Advanced risk management calculations
- [ ] Wyckoff analysis and Elliott Wave detection
- [ ] Mobile app (React Native)
- [ ] Unit and integration test suite
- [ ] Docker containerization
- [ ] Production deployment configuration

## 🛠️ Development

### Project Structure
```
EGXpilot/
├── backend/           # Node.js/Express backend
│   ├── api/          # API routes and middleware
│   ├── models/       # Data models (User, Stock, Portfolio)
│   ├── services/     # Business logic services
│   ├── smart-analysis/ # Technical analysis engine
│   └── utils/        # Helper utilities
├── config/           # Environment and database configuration
│   └── environments/ # Environment-specific configs
├── database/         # SQL Server schema and migrations
├── docker/           # Docker configuration files
├── docs/            # Documentation
│   ├── guides/      # User and deployment guides
│   ├── development/ # Development documentation
│   └── arabic/      # Arabic documentation
├── frontend/        # React application (planned)
├── scripts/         # Utility scripts (init, deploy, backup)
├── tests/           # Test suites
│   ├── unit/       # Unit tests
│   ├── integration/ # Integration tests
│   └── manual/     # Manual test scripts
└── logs/           # Application logs
```

### Available Scripts
- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server
- `npm run init-db` - Initialize database schema and seed data
- `npm test` - Run test suite
- `npm run lint` - Run ESLint

### API Testing
Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","firstName":"Ahmed","lastName":"Hassan"}'
```

### Database Setup
1. Install SQL Server (Express edition is sufficient)
2. Create a database named `egxpilot_dev`
3. Update `.env` with your database credentials
4. Run `npm run init-db` to create tables and seed data

## 🎯 نظرة عامة

EGXpilot هو نظام ذكي متطور لتحليل الأسهم المصرية وتقديم توصيات استثمارية مبنية على:

- **التحليل الفني المتقدم**: RSI, MACD, ADX, Stochastic
- **نظريات التداول**: Wyckoff, Elliott Wave, Candlestick Patterns
- **محرك الفرص الذهبية**: اكتشاف تلقائي للفرص الاستثمارية
- **إدارة المخاطر**: حساب أحجام المراكز وتنويع المحفظة
- **التحليل الآني**: بيانات حية مع تحديثات فورية

## 🚀 المزايا الرئيسية

### 🔍 **محرك الفرص الذهبية**
- مسح تلقائي لـ 50+ سهم من أنشط الأسهم المصرية
- تحديد الفرص عالية الاحتمالية (score > 85%)
- تنبيهات فورية للفرص الاستثنائية
- تحليل متعدد الإطارات الزمنية

### 📊 **التحليل الفني المتقدم**
- مؤشرات الزخم: RSI, MACD, Stochastic
- مؤشرات الاتجاه: EMA, SMA, Bollinger Bands
- تحليل الحجم: OBV, Volume Profile
- أنماط الشموع اليابانية مع درجات الثقة

### 🎯 **نظام التوصيات الذكي**
- توصيات شراء/بيع مع مستويات الدخول
- أهداف متعددة مع احتمالية التحقق
- نقاط وقف الخسارة المحسوبة
- نسب المخاطر مقابل العوائد

### 🛡️ **إدارة المخاطر**
- حساب أحجام المراكز حسب المخاطر
- تنويع القطاعات والأسهم
- مراقبة حدود التعرض للمخاطر
- تنبيهات المخاطر المرتفعة

## 🏗️ البنية التقنية

```
EGXPILOT/
├── backend/                    # خادم Node.js
│   ├── api/                   # واجهات برمجة التطبيقات
│   ├── services/              # خدمات العمل
│   ├── smart-analysis/        # محرك التحليل الذكي
│   │   ├── indicators/        # المؤشرات الفنية
│   │   ├── patterns/          # أنماط التداول
│   │   ├── opportunity-hunter/ # محرك الفرص
│   │   └── risk/             # إدارة المخاطر
│   └── data/                  # جمع ومعالجة البيانات
├── database/                  # قاعدة بيانات SQL Server
├── frontend/                  # واجهة React
├── config/                    # إعدادات النظام
└── docs/                      # الوثائق
```

## 🛠️ متطلبات التشغيل

### الحد الأدنى:
- **Node.js**: 18.0 أو أحدث
- **SQL Server**: 2019 أو أحدث (أو SQL Server Express)
- **Redis**: 7.0 أو أحدث
- **الذاكرة**: 4GB RAM كحد أدنى
- **المعالج**: Dual-core 2.5GHz

### الموصى به للإنتاج:
- **Node.js**: 20.0 LTS
- **SQL Server**: 2022
- **Redis**: 7.2
- **الذاكرة**: 16GB RAM
- **المعالج**: Quad-core 3.0GHz
- **التخزين**: SSD مع 100GB مساحة فارغة

## 🚀 التثبيت والتشغيل

### 1. استنساخ المشروع
```bash
git clone https://github.com/your-username/egxpilot.git
cd egxpilot
```

### 2. تثبيت التبعيات
```bash
npm install
```

### 3. إعداد قاعدة البيانات
```bash
# إنشاء قاعدة البيانات
npm run db:create

# تشغيل migrations
npm run migrate

# إدراج البيانات الأولية
npm run seed
```

### 4. إعداد متغيرات البيئة
```bash
cp .env.example .env
# قم بتحرير ملف .env وإضافة إعداداتك
```

### 5. تشغيل Redis
```bash
# على Windows (مع Docker)
docker run -d --name egx-redis -p 6379:6379 redis:7

# على Linux/Mac
redis-server
```

### 6. تشغيل النظام
```bash
# بيئة التطوير
npm run dev

# بيئة الإنتاج
npm start
```

## 📊 استخدام محرك الفرص الذهبية

### تشغيل المسح اليدوي
```bash
curl -X POST http://localhost:5000/api/opportunities/scan
```

### الحصول على أحدث الفرص
```bash
curl http://localhost:5000/api/opportunities/latest
```

### مثال على استجابة الفرص
```json
{
  "scanTime": "2025-06-11T14:30:00Z",
  "topOpportunities": [
    {
      "symbol": "HRHO.CA",
      "companyName": "Hassan Allam Holding",
      "score": 0.92,
      "confidence": "VERY_HIGH",
      "recommendation": {
        "action": "STRONG_BUY",
        "entryZone": [15.10, 15.30],
        "targets": [
          {"level": 1, "price": 17.50, "probability": 0.85}
        ],
        "stopLoss": 14.20,
        "riskReward": 4.2
      }
    }
  ]
}
```

## 🔧 إعداد التنبيهات

### تنبيهات البريد الإلكتروني
```javascript
// في ملف .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### تنبيهات WhatsApp (قريباً)
```javascript
WHATSAPP_API_TOKEN=your_token
WHATSAPP_PHONE_ID=your_phone_id
```

## 📈 مؤشرات الأداء

### معدلات النجاح المستهدفة:
- **دقة التوصيات**: 70%+ win rate
- **نسبة المخاطر/العوائد**: 1:3 كحد أدنى
- **وقت الاستجابة**: < 2 ثانية للتحليل
- **توفر النظام**: 99.5% خلال ساعات التداول

### إحصائيات الأداء الحالية:
```bash
# للحصول على إحصائيات النظام
curl http://localhost:5000/api/health
```

## 🛡️ الأمان والامتثال

### إخلاء المسؤولية القانوني
```
⚠️ تنبيه هام: هذا النظام يوفر تحليلات فنية فقط وليس نصائح استثمارية. 
التداول في الأسهم ينطوي على مخاطر خسارة رأس المال. 
يجب استشارة مستشار مالي مرخص قبل اتخاذ أي قرارات استثمارية.
```

### حماية البيانات
- تشفير جميع كلمات المرور
- حماية من SQL Injection
- Rate limiting للواجهات البرمجية
- تسجيل جميع العمليات للمراجعة

## 🤝 المساهمة في المشروع

### إرشادات المساهمة:
1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى البرانش (`git push origin feature/amazing-feature`)
5. فتح Pull Request

### معايير الكود:
- استخدام ESLint للتنسيق
- كتابة اختبارات للمزايا الجديدة
- توثيق شامل للدوال
- التزام بمعايير الأمان

## 📝 التحديثات والدعم

### الإصدارات المخططة:
- **v1.1**: تطبيق الموبايل (React Native)
- **v1.2**: تحليل الأخبار والمشاعر
- **v1.3**: التداول الآلي (بعد الحصول على التراخيص)
- **v2.0**: الذكاء الاصطناعي للتنبؤ

### الحصول على الدعم:
- **المشاكل التقنية**: فتح issue على GitHub
- **الأسئلة العامة**: قناة Discord المخصصة
- **الدعم المميز**: egxpilot.support@gmail.com

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT. انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 🙏 شكر وتقدير

- فريق Yahoo Finance للـ API المجاني
- مجتمع Technical Indicators للمكتبات
- البورصة المصرية للبيانات المفتوحة
- جميع المساهمين في المشروع

---

<div align="center">
  <p><strong>🚀 ابدأ رحلتك في التداول الذكي مع EGXpilot</strong></p>
  <p>صُنع بـ ❤️ للمتداولين المصريين</p>
</div>

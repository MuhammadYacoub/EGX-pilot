# 🚀 دليل التشغيل السريع - EGXpilot

## البدء السريع (5 دقائق)

### 1. التحضير الأولي
```bash
# نسخ المشروع
git clone https://github.com/ya3qoup/EGXpilot.git
cd EGXpilot

# تشغيل السكريبت السريع
chmod +x quick-start.sh
./quick-start.sh
```

### 2. الوصول للنظام
- **التطبيق**: http://localhost:5000
- **فحص الصحة**: http://localhost:5000/health
- **الوثائق**: http://localhost:5000/api

## الأوامر الأساسية

### إدارة النظام
```bash
# بدء التشغيل
npm start
# أو
./quick-start.sh start

# إيقاف التشغيل
./quick-start.sh stop

# إعادة التشغيل
./quick-start.sh restart

# عرض الحالة
./quick-start.sh status
```

### اختبار النظام
```bash
# اختبارات التطوير
npm test

# اختبارات الإنتاج
npm run test:production

# اختبارات شاملة
npm run test:all
```

### مراقبة النظام
```bash
# فحص الصحة
npm run health-check

# مراقبة مستمرة
npm run monitor

# عرض السجلات
npm run logs
```

## API Examples

### تسجيل مستخدم جديد
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "Password123!",
    "firstName": "أحمد",
    "lastName": "محمد"
  }'
```

### تسجيل الدخول
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "Password123!"
  }'
```

### الحصول على بيانات الأسهم
```bash
curl http://localhost:5000/api/stocks
```

### تشغيل مسح الفرص
```bash
curl -X POST http://localhost:5000/api/opportunities/scan
```

### الحصول على أحدث الفرص
```bash
curl http://localhost:5000/api/opportunities/latest
```

## التحليل الفني

### مؤشرات متاحة
- **RSI**: مؤشر القوة النسبية
- **MACD**: تقارب وتباعد المتوسطات المتحركة
- **Stochastic**: مذبذب ستوكاستيك
- **Volume Analysis**: تحليل الحجم
- **Moving Averages**: المتوسطات المتحركة

### مثال على التحليل الفني
```bash
curl http://localhost:5000/api/analysis/technical/HRHO.CA
```

### استجابة نموذجية
```json
{
  "symbol": "HRHO.CA",
  "timestamp": "2025-06-14T10:00:00Z",
  "indicators": {
    "rsi": {
      "value": 65.5,
      "signal": "NEUTRAL",
      "interpretation": "قريب من منطقة ذروة الشراء"
    },
    "macd": {
      "macd": 0.45,
      "signal": 0.32,
      "histogram": 0.13,
      "trend": "BULLISH"
    }
  },
  "recommendation": {
    "action": "BUY",
    "confidence": "HIGH",
    "entry": [15.20, 15.40],
    "targets": [17.50, 19.00],
    "stopLoss": 14.00
  }
}
```

## محرك الفرص الذهبية

### كيف يعمل
1. **المسح التلقائي**: كل 3 دقائق لـ 50+ سهم
2. **التحليل متعدد المؤشرات**: RSI, MACD, Volume, Price Action
3. **النقاط**: من 0 إلى 100 (85+ فرصة ممتازة)
4. **التوصيات**: شراء/بيع مع مستويات الدخول والأهداف

### أنواع الفرص
- **Momentum Breakout**: اختراق الزخم
- **Volume Surge**: ارتفاع حجم التداول
- **Technical Reversal**: انعكاس فني
- **Support/Resistance**: دعم ومقاومة

## إدارة المحافظ

### إنشاء محفظة
```bash
curl -X POST http://localhost:5000/api/portfolios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "محفظة النمو",
    "description": "محفظة للاستثمار طويل الأجل",
    "initialCapital": 100000
  }'
```

### إضافة سهم للمحفظة
```bash
curl -X POST http://localhost:5000/api/portfolios/1/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "symbol": "HRHO.CA",
    "type": "BUY",
    "quantity": 1000,
    "price": 15.25
  }'
```

## التنبيهات والإشعارات

### أنواع التنبيهات
- **فرص استثمارية**: عند اكتشاف فرصة جديدة
- **تحرك الأسعار**: عند تجاوز مستويات محددة
- **إدارة المخاطر**: عند تجاوز حدود المخاطرة
- **تحديثات المحفظة**: عند تغيرات هامة

## استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### خطأ في الاتصال بقاعدة البيانات
```bash
# تحقق من إعدادات قاعدة البيانات
node -e "require('./config/database').testConnection().then(console.log).catch(console.error)"

# إعادة إنشاء قاعدة البيانات
npm run init-db
```

#### خطأ في Redis
```bash
# تحقق من تشغيل Redis
redis-cli ping

# إعادة تشغيل Redis
sudo systemctl restart redis-server
```

#### بطء في الاستجابة
```bash
# تحقق من استخدام الموارد
npm run monitor

# مسح الذاكرة المؤقتة
redis-cli flushall
```

### سجلات النظام
```bash
# سجلات التطبيق
tail -f egxpilot.log

# سجلات قاعدة البيانات
# (يعتمد على إعداد SQL Server)

# سجلات النظام
journalctl -u egxpilot -f
```

## الدعم والمساعدة

### جهات الاتصال
- **البريد الإلكتروني**: ya3qoup@gmail.com
- **GitHub Issues**: https://github.com/ya3qoup/EGXpilot/issues

### الموارد المفيدة
- [وثائق SQL Server](https://docs.microsoft.com/en-us/sql/)
- [دليل Redis](https://redis.io/documentation)
- [وثائق Node.js](https://nodejs.org/en/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)

### إخلاء المسؤولية
⚠️ **تنبيه هام**: هذا النظام للأغراض التعليمية والتحليلية فقط. لا يُعتبر نصيحة مالية. يُنصح باستشارة مختص مالي قبل اتخاذ قرارات استثمارية.

---
**EGXpilot** - نظام ذكي لتحليل البورصة المصرية 🇪🇬

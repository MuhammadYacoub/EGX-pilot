-- EGXpilot Seed Data
-- Egyptian Stock Exchange (EGX) Stocks

USE [egxpilot_dev];
GO

-- Insert Egyptian Stock Exchange Stocks
-- EGX 30 Index Stocks + Additional Popular Stocks

INSERT INTO Stocks (Symbol, Name, NameArabic, Sector, SectorArabic, MarketCap, Exchange, IsActive) VALUES
-- Banking Sector
('CIB', 'Commercial International Bank', 'البنك التجاري الدولي', 'Banking', 'البنوك', 120000000000, 'EGX', 1),
('QNB', 'QNB Al Ahli Bank', 'بنك قطر الوطني الأهلي', 'Banking', 'البنوك', 45000000000, 'EGX', 1),
('ADIB', 'Abu Dhabi Islamic Bank', 'بنك أبوظبي الإسلامي', 'Banking', 'البنوك', 25000000000, 'EGX', 1),
('CAE', 'Credit Agricole Egypt', 'كريدي أجريكول مصر', 'Banking', 'البنوك', 15000000000, 'EGX', 1),
('ADCB', 'Abu Dhabi Commercial Bank', 'بنك أبوظبي التجاري', 'Banking', 'البنوك', 18000000000, 'EGX', 1),

-- Telecommunications
('ORASCOM', 'Orascom TMT Investments', 'أوراسكوم للاستثمار', 'Telecommunications', 'الاتصالات', 8000000000, 'EGX', 1),
('ETEL', 'Egypt Telecom', 'المصرية للاتصالات', 'Telecommunications', 'الاتصالات', 22000000000, 'EGX', 1),

-- Real Estate
('TMG', 'Talaat Moustafa Group', 'مجموعة طلعت مصطفى', 'Real Estate', 'العقارات', 35000000000, 'EGX', 1),
('PHD', 'Palm Hills Developments', 'بالم هيلز للتطوير العقاري', 'Real Estate', 'العقارات', 12000000000, 'EGX', 1),
('MNHD', 'Madinet Nasr Housing', 'الإسكان والتعمير', 'Real Estate', 'العقارات', 8000000000, 'EGX', 1),
('SODIC', 'Sixth of October Development', 'سوديك', 'Real Estate', 'العقارات', 15000000000, 'EGX', 1),

-- Food & Beverages
('JUFO', 'Juhayna Food Industries', 'جهينة للصناعات الغذائية', 'Food & Beverages', 'الأغذية والمشروبات', 5000000000, 'EGX', 1),
('DFSK', 'Domty Food Products', 'دومتي للمنتجات الغذائية', 'Food & Beverages', 'الأغذية والمشروبات', 3000000000, 'EGX', 1),
('EDFA', 'Edfa Food Industries', 'إدفا للمواد الغذائية', 'Food & Beverages', 'الأغذية والمشروبات', 2500000000, 'EGX', 1),

-- Chemicals & Fertilizers
('KIMA', 'Kima Chemical Industries', 'كيما للصناعات الكيماوية', 'Chemicals', 'الكيماويات', 4000000000, 'EGX', 1),
('EFERT', 'Egyptian Financial Group', 'المجموعة المالية المصرية', 'Chemicals', 'الكيماويات', 6000000000, 'EGX', 1),
('ACGC', 'Alexandria Carbon & Chlor-Alkali', 'الإسكندرية للكربون والكلور القلوي', 'Chemicals', 'الكيماويات', 2000000000, 'EGX', 1),

-- Cement
('HCIC', 'Helwan Cement Company', 'أسمنت حلوان', 'Construction Materials', 'مواد البناء', 8000000000, 'EGX', 1),
('SUCE', 'Suez Cement Company', 'أسمنت السويس', 'Construction Materials', 'مواد البناء', 12000000000, 'EGX', 1),
('TORA', 'Tora Cement Company', 'أسمنت طرة', 'Construction Materials', 'مواد البناء', 6000000000, 'EGX', 1),

-- Steel & Iron
('ESRS', 'Egyptian Steel', 'الحديد والصلب المصرية', 'Basic Materials', 'المواد الأساسية', 10000000000, 'EGX', 1),
('IRON', 'Alexandria Mineral Oils', 'الإسكندرية للزيوت المعدنية', 'Basic Materials', 'المواد الأساسية', 3000000000, 'EGX', 1),

-- Tourism & Entertainment
('EHG', 'Egyptian Hotels Group', 'المجموعة المصرية للفنادق', 'Tourism', 'السياحة', 4000000000, 'EGX', 1),
('SHMS', 'Sharm Dreams', 'أحلام شرم', 'Tourism', 'السياحة', 1500000000, 'EGX', 1),

-- Pharmaceuticals
('EIPICO', 'Egyptian International Pharmaceutical', 'ايبيكو', 'Pharmaceuticals', 'الأدوية', 3500000000, 'EGX', 1),
('PHAR', 'Alexandria Pharmaceuticals', 'الإسكندرية للأدوية', 'Pharmaceuticals', 'الأدوية', 2800000000, 'EGX', 1),
('ACDP', 'Arab Cotton Ginning', 'العربية لحليج الأقطان', 'Pharmaceuticals', 'الأدوية', 1200000000, 'EGX', 1),

-- Textiles
('KABO', 'Kabo Textiles', 'كابو للمنسوجات', 'Textiles', 'المنسوجات', 800000000, 'EGX', 1),
('EITR', 'Egyptian International Trading', 'المصرية الدولية للتجارة', 'Textiles', 'المنسوجات', 600000000, 'EGX', 1),

-- Oil & Gas
('EGPC', 'Egyptian General Petroleum', 'الهيئة العامة للبترول', 'Oil & Gas', 'البترول والغاز', 25000000000, 'EGX', 1),
('ALEX', 'Alexandria Petroleum', 'بترول الإسكندرية', 'Oil & Gas', 'البترول والغاز', 8000000000, 'EGX', 1),

-- Utilities
('EGHE', 'Egyptian Electric Holding', 'القابضة المصرية للكهرباء', 'Utilities', 'المرافق العامة', 15000000000, 'EGX', 1),
('SWDY', 'Suez Water Company', 'مياه السويس', 'Utilities', 'المرافق العامة', 3000000000, 'EGX', 1),

-- Transportation
('EGTS', 'Egyptian Transport Services', 'الخدمات المصرية للنقل', 'Transportation', 'النقل', 2000000000, 'EGX', 1),
('CRCI', 'Cairo Airport Company', 'شركة مطار القاهرة', 'Transportation', 'النقل', 5000000000, 'EGX', 1),

-- Financial Services (Non-Banking)
('HRHO', 'Hassan Allam Holding', 'مجموعة حسن علام القابضة', 'Financial Services', 'الخدمات المالية', 7000000000, 'EGX', 1),
('EIFL', 'Egyptian Investment Fund', 'صندوق الاستثمار المصري', 'Financial Services', 'الخدمات المالية', 4000000000, 'EGX', 1),

-- Technology
('RAYA', 'Raya Holding', 'راية القابضة للتكنولوجيا المالية', 'Technology', 'التكنولوجيا', 6000000000, 'EGX', 1),
('IHC', 'Integrated Healthcare Holdings', 'القابضة المتكاملة للرعاية الصحية', 'Healthcare', 'الرعاية الصحية', 3500000000, 'EGX', 1),

-- Media
('EGMH', 'Egyptian Media Production City', 'مدينة الإنتاج الإعلامي', 'Media', 'الإعلام', 1200000000, 'EGX', 1),

-- Industrial
('SKPC', 'Sidi Kerir Petrochemicals', 'سيدي كرير للبتروكيماويات', 'Petrochemicals', 'البتروكيماويات', 9000000000, 'EGX', 1),
('AMOC', 'Alexandria Mineral Oils Company', 'الإسكندرية للزيوت المعدنية', 'Industrial', 'الصناعات', 2500000000, 'EGX', 1),

-- Additional Popular Stocks
('OCDI', 'Orascom Construction Industries', 'أوراسكوم للإنشاء والصناعة', 'Construction', 'الإنشاءات', 18000000000, 'EGX', 1),
('ELSH', 'El Shamadan', 'الشمدان', 'Consumer Goods', 'السلع الاستهلاكية', 1800000000, 'EGX', 1),
('MFPC', 'Misr Fertilizers Production Company', 'شركة مصر لإنتاج الأسمدة', 'Chemicals', 'الكيماويات', 7500000000, 'EGX', 1),
('ECAP', 'Egyptian Capital', 'رأس المال المصري', 'Financial Services', 'الخدمات المالية', 2200000000, 'EGX', 1),
('CLHO', 'Cleopatra Hospitals Group', 'مجموعة مستشفيات كليوباترا', 'Healthcare', 'الرعاية الصحية', 8500000000, 'EGX', 1),
('EXPO', 'Export Development Bank', 'بنك تنمية الصادرات', 'Banking', 'البنوك', 3500000000, 'EGX', 1),
('OTMT', 'Oriental Tiles Manufacturing', 'الشرقية لصناعة البلاط', 'Construction Materials', 'مواد البناء', 1500000000, 'EGX', 1),
('MENA', 'MENA Tourism and Hotels', 'مينا للسياحة والفنادق', 'Tourism', 'السياحة', 2800000000, 'EGX', 1);

-- Create a default admin user (password should be hashed in real implementation)
INSERT INTO Users (Email, PasswordHash, FirstName, LastName, Role, SubscriptionType, IsEmailVerified, IsActive)
VALUES 
('admin@egxpilot.com', '$2b$10$dummy.hash.for.admin.user.replace.in.production', 'System', 'Admin', 'ADMIN', 'ENTERPRISE', 1, 1),
('demo@egxpilot.com', '$2b$10$dummy.hash.for.demo.user.replace.in.production', 'Demo', 'User', 'USER', 'PREMIUM', 1, 1);

PRINT 'EGXpilot seed data inserted successfully!';
PRINT 'Total stocks inserted: ' + CAST(@@ROWCOUNT AS NVARCHAR(10));
GO

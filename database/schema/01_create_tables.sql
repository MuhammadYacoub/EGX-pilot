-- EGXpilot Database Schema
-- SQL Server 2019+ Compatible
-- Created: 2024

USE [egxpilot_dev];
GO

-- Drop existing tables if they exist (for development)
IF OBJECT_ID('dbo.UserSessions', 'U') IS NOT NULL DROP TABLE dbo.UserSessions;
IF OBJECT_ID('dbo.AlertNotifications', 'U') IS NOT NULL DROP TABLE dbo.AlertNotifications;
IF OBJECT_ID('dbo.OpportunityAlerts', 'U') IS NOT NULL DROP TABLE dbo.OpportunityAlerts;
IF OBJECT_ID('dbo.PortfolioTransactions', 'U') IS NOT NULL DROP TABLE dbo.PortfolioTransactions;
IF OBJECT_ID('dbo.PortfolioHoldings', 'U') IS NOT NULL DROP TABLE dbo.PortfolioHoldings;
IF OBJECT_ID('dbo.Portfolios', 'U') IS NOT NULL DROP TABLE dbo.Portfolios;
IF OBJECT_ID('dbo.MarketOpportunities', 'U') IS NOT NULL DROP TABLE dbo.MarketOpportunities;
IF OBJECT_ID('dbo.TechnicalAnalysis', 'U') IS NOT NULL DROP TABLE dbo.TechnicalAnalysis;
IF OBJECT_ID('dbo.StockData', 'U') IS NOT NULL DROP TABLE dbo.StockData;
IF OBJECT_ID('dbo.Stocks', 'U') IS NOT NULL DROP TABLE dbo.Stocks;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- Users Table
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    PhoneNumber NVARCHAR(20),
    IsEmailVerified BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    Role NVARCHAR(20) DEFAULT 'USER' CHECK (Role IN ('USER', 'ADMIN', 'PREMIUM')),
    SubscriptionType NVARCHAR(20) DEFAULT 'FREE' CHECK (SubscriptionType IN ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE')),
    SubscriptionExpiresAt DATETIME2,
    Preferences NVARCHAR(MAX) CHECK (ISJSON(Preferences) = 1), -- JSON preferences
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    LastLoginAt DATETIME2
);
GO

-- User Sessions for JWT token management
CREATE TABLE UserSessions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    TokenHash NVARCHAR(255) NOT NULL,
    DeviceInfo NVARCHAR(500),
    IpAddress NVARCHAR(45),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    ExpiresAt DATETIME2 NOT NULL
);
GO

-- Stocks Table - Egyptian Stock Exchange
CREATE TABLE Stocks (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Symbol NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(200) NOT NULL,
    NameArabic NVARCHAR(200),
    Sector NVARCHAR(100),
    SectorArabic NVARCHAR(100),
    MarketCap BIGINT,
    Currency NVARCHAR(3) DEFAULT 'EGP',
    Exchange NVARCHAR(10) DEFAULT 'EGX',
    IsActive BIT DEFAULT 1,
    ListedDate DATE,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- Stock Data - OHLCV and additional metrics
CREATE TABLE StockData (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StockId UNIQUEIDENTIFIER NOT NULL REFERENCES Stocks(Id) ON DELETE CASCADE,
    Date DATE NOT NULL,
    TimeFrame NVARCHAR(10) NOT NULL CHECK (TimeFrame IN ('1d', '1h', '30m', '15m', '5m')),
    [Open] DECIMAL(18,4) NOT NULL,
    [High] DECIMAL(18,4) NOT NULL,
    [Low] DECIMAL(18,4) NOT NULL,
    [Close] DECIMAL(18,4) NOT NULL,
    Volume BIGINT NOT NULL,
    AdjustedClose DECIMAL(18,4),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_StockData_StockId_Date_TimeFrame UNIQUE (StockId, Date, TimeFrame)
);
GO

-- Technical Analysis Results
CREATE TABLE TechnicalAnalysis (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StockId UNIQUEIDENTIFIER NOT NULL REFERENCES Stocks(Id) ON DELETE CASCADE,
    AnalysisDate DATETIME2 NOT NULL,
    TimeFrame NVARCHAR(10) NOT NULL,
    
    -- Momentum Indicators
    RSI DECIMAL(10,4),
    RSIDivergence NVARCHAR(20) CHECK (RSIDivergence IN ('BULLISH', 'BEARISH', 'NONE')),
    MACD DECIMAL(18,6),
    MACDSignal DECIMAL(18,6),
    MACDHistogram DECIMAL(18,6),
    MACDDivergence NVARCHAR(20) CHECK (MACDDivergence IN ('BULLISH', 'BEARISH', 'NONE')),
    StochasticK DECIMAL(10,4),
    StochasticD DECIMAL(10,4),
    StochasticDivergence NVARCHAR(20) CHECK (StochasticDivergence IN ('BULLISH', 'BEARISH', 'NONE')),
    
    -- Volume Indicators
    VolumeMA BIGINT,
    VolumeRatio DECIMAL(10,4),
    OnBalanceVolume BIGINT,
    
    -- Price Action
    SMA20 DECIMAL(18,4),
    SMA50 DECIMAL(18,4),
    SMA200 DECIMAL(18,4),
    EMA12 DECIMAL(18,4),
    EMA26 DECIMAL(18,4),
    BollingerUpper DECIMAL(18,4),
    BollingerMiddle DECIMAL(18,4),
    BollingerLower DECIMAL(18,4),
    
    -- Pattern Detection
    CandlestickPattern NVARCHAR(50),
    ChartPattern NVARCHAR(50),
    SupportLevel DECIMAL(18,4),
    ResistanceLevel DECIMAL(18,4),
    
    -- Overall Signals
    MomentumScore DECIMAL(5,4),
    VolumeScore DECIMAL(5,4),
    PriceActionScore DECIMAL(5,4),
    PatternScore DECIMAL(5,4),
    OverallScore DECIMAL(5,4),
    
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_TechnicalAnalysis_StockId_Date_TimeFrame UNIQUE (StockId, AnalysisDate, TimeFrame)
);
GO

-- Market Opportunities
CREATE TABLE MarketOpportunities (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StockId UNIQUEIDENTIFIER NOT NULL REFERENCES Stocks(Id) ON DELETE CASCADE,
    OpportunityType NVARCHAR(50) NOT NULL CHECK (OpportunityType IN ('BUY', 'SELL', 'WATCH', 'BREAKOUT', 'REVERSAL')),
    Score DECIMAL(5,4) NOT NULL,
    Confidence DECIMAL(5,4) NOT NULL,
    EntryPrice DECIMAL(18,4),
    TargetPrice DECIMAL(18,4),
    StopLoss DECIMAL(18,4),
    TimeFrame NVARCHAR(10) NOT NULL,
    
    -- Detailed Analysis
    Signals NVARCHAR(MAX) CHECK (ISJSON(Signals) = 1), -- JSON array of signals
    Analysis NVARCHAR(MAX), -- Human readable analysis
    AnalysisArabic NVARCHAR(MAX), -- Arabic analysis
    
    -- Status
    Status NVARCHAR(20) DEFAULT 'ACTIVE' CHECK (Status IN ('ACTIVE', 'TRIGGERED', 'EXPIRED', 'CANCELLED')),
    ExpiresAt DATETIME2,
    
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- Portfolios
CREATE TABLE Portfolios (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    InitialCapital DECIMAL(18,2) NOT NULL,
    CurrentValue DECIMAL(18,2) DEFAULT 0,
    CashBalance DECIMAL(18,2) DEFAULT 0,
    TotalReturn DECIMAL(18,2) DEFAULT 0,
    TotalReturnPercentage DECIMAL(10,4) DEFAULT 0,
    IsDefault BIT DEFAULT 0,
    Currency NVARCHAR(3) DEFAULT 'EGP',
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- Portfolio Holdings
CREATE TABLE PortfolioHoldings (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PortfolioId UNIQUEIDENTIFIER NOT NULL REFERENCES Portfolios(Id) ON DELETE CASCADE,
    StockId UNIQUEIDENTIFIER NOT NULL REFERENCES Stocks(Id) ON DELETE CASCADE,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    AveragePrice DECIMAL(18,4) NOT NULL,
    CurrentPrice DECIMAL(18,4),
    TotalCost DECIMAL(18,2) NOT NULL,
    CurrentValue DECIMAL(18,2),
    UnrealizedGainLoss DECIMAL(18,2),
    UnrealizedGainLossPercentage DECIMAL(10,4),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_PortfolioHoldings_Portfolio_Stock UNIQUE (PortfolioId, StockId)
);
GO

-- Portfolio Transactions
CREATE TABLE PortfolioTransactions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PortfolioId UNIQUEIDENTIFIER NOT NULL REFERENCES Portfolios(Id) ON DELETE CASCADE,
    StockId UNIQUEIDENTIFIER REFERENCES Stocks(Id),
    TransactionType NVARCHAR(20) NOT NULL CHECK (TransactionType IN ('BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL', 'DIVIDEND')),
    Quantity INT,
    Price DECIMAL(18,4),
    Amount DECIMAL(18,2) NOT NULL,
    Fees DECIMAL(18,2) DEFAULT 0,
    Notes NVARCHAR(500),
    ExecutedAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- Opportunity Alerts
CREATE TABLE OpportunityAlerts (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    StockId UNIQUEIDENTIFIER REFERENCES Stocks(Id) ON DELETE CASCADE,
    AlertType NVARCHAR(50) NOT NULL CHECK (AlertType IN ('PRICE', 'VOLUME', 'TECHNICAL', 'OPPORTUNITY')),
    Condition NVARCHAR(100) NOT NULL, -- e.g., 'price > 100', 'rsi < 30'
    TargetValue DECIMAL(18,4),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    TriggeredAt DATETIME2
);
GO

-- Alert Notifications
CREATE TABLE AlertNotifications (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    AlertId UNIQUEIDENTIFIER REFERENCES OpportunityAlerts(Id) ON DELETE CASCADE,
    OpportunityId UNIQUEIDENTIFIER REFERENCES MarketOpportunities(Id) ON DELETE CASCADE,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(1000) NOT NULL,
    MessageArabic NVARCHAR(1000),
    NotificationType NVARCHAR(20) NOT NULL CHECK (NotificationType IN ('EMAIL', 'SMS', 'PUSH', 'IN_APP')),
    Status NVARCHAR(20) DEFAULT 'PENDING' CHECK (Status IN ('PENDING', 'SENT', 'FAILED', 'READ')),
    SentAt DATETIME2,
    ReadAt DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- Create Indexes for Performance
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_IsActive ON Users(IsActive);
CREATE INDEX IX_UserSessions_UserId ON UserSessions(UserId);
CREATE INDEX IX_UserSessions_TokenHash ON UserSessions(TokenHash);
CREATE INDEX IX_UserSessions_IsActive ON UserSessions(IsActive);

CREATE INDEX IX_Stocks_Symbol ON Stocks(Symbol);
CREATE INDEX IX_Stocks_IsActive ON Stocks(IsActive);
CREATE INDEX IX_Stocks_Sector ON Stocks(Sector);

CREATE INDEX IX_StockData_StockId ON StockData(StockId);
CREATE INDEX IX_StockData_Date ON StockData(Date);
CREATE INDEX IX_StockData_TimeFrame ON StockData(TimeFrame);

CREATE INDEX IX_TechnicalAnalysis_StockId ON TechnicalAnalysis(StockId);
CREATE INDEX IX_TechnicalAnalysis_AnalysisDate ON TechnicalAnalysis(AnalysisDate);
CREATE INDEX IX_TechnicalAnalysis_OverallScore ON TechnicalAnalysis(OverallScore);

CREATE INDEX IX_MarketOpportunities_StockId ON MarketOpportunities(StockId);
CREATE INDEX IX_MarketOpportunities_Score ON MarketOpportunities(Score);
CREATE INDEX IX_MarketOpportunities_Status ON MarketOpportunities(Status);
CREATE INDEX IX_MarketOpportunities_CreatedAt ON MarketOpportunities(CreatedAt);

CREATE INDEX IX_Portfolios_UserId ON Portfolios(UserId);
CREATE INDEX IX_PortfolioHoldings_PortfolioId ON PortfolioHoldings(PortfolioId);
CREATE INDEX IX_PortfolioTransactions_PortfolioId ON PortfolioTransactions(PortfolioId);
CREATE INDEX IX_PortfolioTransactions_ExecutedAt ON PortfolioTransactions(ExecutedAt);

CREATE INDEX IX_OpportunityAlerts_UserId ON OpportunityAlerts(UserId);
CREATE INDEX IX_OpportunityAlerts_IsActive ON OpportunityAlerts(IsActive);
CREATE INDEX IX_AlertNotifications_UserId ON AlertNotifications(UserId);
CREATE INDEX IX_AlertNotifications_Status ON AlertNotifications(Status);

PRINT 'EGXpilot database schema created successfully!';
GO

-- EGXpilot Stored Procedures
-- Common database operations for performance optimization

USE [egxpilot_dev];
GO

-- Get User Portfolio Summary
CREATE OR ALTER PROCEDURE GetUserPortfolioSummary
    @UserId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT 
        p.Id,
        p.Name,
        p.InitialCapital,
        p.CurrentValue,
        p.CashBalance,
        p.TotalReturn,
        p.TotalReturnPercentage,
        p.Currency,
        COUNT(ph.Id) as HoldingsCount,
        SUM(ph.CurrentValue) as TotalHoldingsValue
    FROM Portfolios p
    LEFT JOIN PortfolioHoldings ph ON p.Id = ph.PortfolioId
    WHERE p.UserId = @UserId
    GROUP BY p.Id, p.Name, p.InitialCapital, p.CurrentValue, p.CashBalance, 
             p.TotalReturn, p.TotalReturnPercentage, p.Currency
    ORDER BY p.CreatedAt;
END;
GO

-- Get Portfolio Holdings with Current Prices
CREATE OR ALTER PROCEDURE GetPortfolioHoldings
    @PortfolioId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT 
        ph.Id,
        s.Symbol,
        s.Name,
        s.NameArabic,
        ph.Quantity,
        ph.AveragePrice,
        ph.CurrentPrice,
        ph.TotalCost,
        ph.CurrentValue,
        ph.UnrealizedGainLoss,
        ph.UnrealizedGainLossPercentage,
        ph.UpdatedAt
    FROM PortfolioHoldings ph
    INNER JOIN Stocks s ON ph.StockId = s.Id
    WHERE ph.PortfolioId = @PortfolioId
    ORDER BY ph.CurrentValue DESC;
END;
GO

-- Update Portfolio Holding Current Price
CREATE OR ALTER PROCEDURE UpdateHoldingCurrentPrice
    @HoldingId UNIQUEIDENTIFIER,
    @CurrentPrice DECIMAL(18,4)
AS
BEGIN
    UPDATE PortfolioHoldings 
    SET 
        CurrentPrice = @CurrentPrice,
        CurrentValue = Quantity * @CurrentPrice,
        UnrealizedGainLoss = (Quantity * @CurrentPrice) - TotalCost,
        UnrealizedGainLossPercentage = CASE 
            WHEN TotalCost > 0 THEN (((Quantity * @CurrentPrice) - TotalCost) / TotalCost) * 100
            ELSE 0
        END,
        UpdatedAt = GETUTCDATE()
    WHERE Id = @HoldingId;
END;
GO

-- Execute Portfolio Transaction
CREATE OR ALTER PROCEDURE ExecutePortfolioTransaction
    @PortfolioId UNIQUEIDENTIFIER,
    @StockId UNIQUEIDENTIFIER = NULL,
    @TransactionType NVARCHAR(20),
    @Quantity INT = NULL,
    @Price DECIMAL(18,4) = NULL,
    @Amount DECIMAL(18,2),
    @Fees DECIMAL(18,2) = 0,
    @Notes NVARCHAR(500) = NULL
AS
BEGIN
    BEGIN TRANSACTION;
    
    DECLARE @TotalAmount DECIMAL(18,2) = @Amount + @Fees;
    
    -- Insert transaction record
    INSERT INTO PortfolioTransactions (PortfolioId, StockId, TransactionType, Quantity, Price, Amount, Fees, Notes, ExecutedAt)
    VALUES (@PortfolioId, @StockId, @TransactionType, @Quantity, @Price, @Amount, @Fees, @Notes, GETUTCDATE());
    
    -- Update portfolio based on transaction type
    IF @TransactionType = 'BUY'
    BEGIN
        -- Reduce cash balance
        UPDATE Portfolios 
        SET CashBalance = CashBalance - @TotalAmount,
            UpdatedAt = GETUTCDATE()
        WHERE Id = @PortfolioId;
        
        -- Update or create holding
        IF EXISTS (SELECT 1 FROM PortfolioHoldings WHERE PortfolioId = @PortfolioId AND StockId = @StockId)
        BEGIN
            UPDATE PortfolioHoldings
            SET 
                AveragePrice = ((AveragePrice * Quantity) + (@Price * @Quantity)) / (Quantity + @Quantity),
                Quantity = Quantity + @Quantity,
                TotalCost = TotalCost + @Amount,
                UpdatedAt = GETUTCDATE()
            WHERE PortfolioId = @PortfolioId AND StockId = @StockId;
        END
        ELSE
        BEGIN
            INSERT INTO PortfolioHoldings (PortfolioId, StockId, Quantity, AveragePrice, TotalCost)
            VALUES (@PortfolioId, @StockId, @Quantity, @Price, @Amount);
        END
    END
    ELSE IF @TransactionType = 'SELL'
    BEGIN
        -- Add cash balance
        UPDATE Portfolios 
        SET CashBalance = CashBalance + (@Amount - @Fees),
            UpdatedAt = GETUTCDATE()
        WHERE Id = @PortfolioId;
        
        -- Update holding
        UPDATE PortfolioHoldings
        SET 
            Quantity = Quantity - @Quantity,
            TotalCost = TotalCost - (AveragePrice * @Quantity),
            UpdatedAt = GETUTCDATE()
        WHERE PortfolioId = @PortfolioId AND StockId = @StockId;
        
        -- Remove holding if quantity becomes 0
        DELETE FROM PortfolioHoldings 
        WHERE PortfolioId = @PortfolioId AND StockId = @StockId AND Quantity <= 0;
    END
    ELSE IF @TransactionType = 'DEPOSIT'
    BEGIN
        UPDATE Portfolios 
        SET CashBalance = CashBalance + @Amount,
            UpdatedAt = GETUTCDATE()
        WHERE Id = @PortfolioId;
    END
    ELSE IF @TransactionType = 'WITHDRAWAL'
    BEGIN
        UPDATE Portfolios 
        SET CashBalance = CashBalance - @Amount,
            UpdatedAt = GETUTCDATE()
        WHERE Id = @PortfolioId;
    END
    
    COMMIT TRANSACTION;
END;
GO

-- Get Top Market Opportunities
CREATE OR ALTER PROCEDURE GetTopMarketOpportunities
    @Limit INT = 20,
    @MinScore DECIMAL(5,4) = 0.65,
    @OpportunityType NVARCHAR(50) = NULL
AS
BEGIN
    SELECT TOP (@Limit)
        mo.Id,
        s.Symbol,
        s.Name,
        s.NameArabic,
        s.Sector,
        mo.OpportunityType,
        mo.Score,
        mo.Confidence,
        mo.EntryPrice,
        mo.TargetPrice,
        mo.StopLoss,
        mo.TimeFrame,
        mo.Analysis,
        mo.AnalysisArabic,
        mo.CreatedAt
    FROM MarketOpportunities mo
    INNER JOIN Stocks s ON mo.StockId = s.Id
    WHERE mo.Status = 'ACTIVE'
        AND mo.Score >= @MinScore
        AND (@OpportunityType IS NULL OR mo.OpportunityType = @OpportunityType)
        AND s.IsActive = 1
    ORDER BY mo.Score DESC, mo.CreatedAt DESC;
END;
GO

-- Get Stock Technical Analysis
CREATE OR ALTER PROCEDURE GetStockTechnicalAnalysis
    @StockSymbol NVARCHAR(20),
    @TimeFrame NVARCHAR(10) = '1d',
    @DaysBack INT = 30
AS
BEGIN
    SELECT 
        ta.AnalysisDate,
        ta.RSI,
        ta.RSIDivergence,
        ta.MACD,
        ta.MACDSignal,
        ta.MACDHistogram,
        ta.MACDDivergence,
        ta.StochasticK,
        ta.StochasticD,
        ta.VolumeRatio,
        ta.SMA20,
        ta.SMA50,
        ta.SMA200,
        ta.BollingerUpper,
        ta.BollingerMiddle,
        ta.BollingerLower,
        ta.CandlestickPattern,
        ta.ChartPattern,
        ta.SupportLevel,
        ta.ResistanceLevel,
        ta.MomentumScore,
        ta.VolumeScore,
        ta.PriceActionScore,
        ta.PatternScore,
        ta.OverallScore
    FROM TechnicalAnalysis ta
    INNER JOIN Stocks s ON ta.StockId = s.Id
    WHERE s.Symbol = @StockSymbol
        AND ta.TimeFrame = @TimeFrame
        AND ta.AnalysisDate >= DATEADD(day, -@DaysBack, GETUTCDATE())
    ORDER BY ta.AnalysisDate DESC;
END;
GO

-- Update Portfolio Current Values
CREATE OR ALTER PROCEDURE UpdatePortfolioCurrentValues
    @PortfolioId UNIQUEIDENTIFIER
AS
BEGIN
    -- Update holdings current values (assume current prices are already updated)
    UPDATE PortfolioHoldings
    SET 
        CurrentValue = Quantity * CurrentPrice,
        UnrealizedGainLoss = (Quantity * CurrentPrice) - TotalCost,
        UnrealizedGainLossPercentage = CASE 
            WHEN TotalCost > 0 THEN (((Quantity * CurrentPrice) - TotalCost) / TotalCost) * 100
            ELSE 0
        END,
        UpdatedAt = GETUTCDATE()
    WHERE PortfolioId = @PortfolioId AND CurrentPrice IS NOT NULL;
    
    -- Update portfolio totals
    UPDATE Portfolios
    SET 
        CurrentValue = (
            SELECT COALESCE(SUM(CurrentValue), 0) + CashBalance
            FROM PortfolioHoldings 
            WHERE PortfolioId = @PortfolioId
        ),
        TotalReturn = (
            SELECT COALESCE(SUM(UnrealizedGainLoss), 0)
            FROM PortfolioHoldings 
            WHERE PortfolioId = @PortfolioId
        ),
        TotalReturnPercentage = CASE 
            WHEN InitialCapital > 0 THEN (
                (SELECT COALESCE(SUM(UnrealizedGainLoss), 0) FROM PortfolioHoldings WHERE PortfolioId = @PortfolioId) 
                / InitialCapital
            ) * 100
            ELSE 0
        END,
        UpdatedAt = GETUTCDATE()
    WHERE Id = @PortfolioId;
END;
GO

-- Search Stocks
CREATE OR ALTER PROCEDURE SearchStocks
    @SearchTerm NVARCHAR(100),
    @Limit INT = 10
AS
BEGIN
    SELECT TOP (@Limit)
        Id,
        Symbol,
        Name,
        NameArabic,
        Sector,
        SectorArabic,
        MarketCap,
        Currency
    FROM Stocks
    WHERE IsActive = 1
        AND (
            Symbol LIKE '%' + @SearchTerm + '%'
            OR Name LIKE '%' + @SearchTerm + '%'
            OR NameArabic LIKE '%' + @SearchTerm + '%'
        )
    ORDER BY 
        CASE WHEN Symbol = @SearchTerm THEN 1 ELSE 2 END,
        MarketCap DESC;
END;
GO

-- Get User Active Alerts
CREATE OR ALTER PROCEDURE GetUserActiveAlerts
    @UserId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT 
        oa.Id,
        s.Symbol,
        s.Name,
        oa.AlertType,
        oa.Condition,
        oa.TargetValue,
        oa.CreatedAt
    FROM OpportunityAlerts oa
    INNER JOIN Stocks s ON oa.StockId = s.Id
    WHERE oa.UserId = @UserId
        AND oa.IsActive = 1
    ORDER BY oa.CreatedAt DESC;
END;
GO

PRINT 'EGXpilot stored procedures created successfully!';
GO

// Portfolio Model - Portfolio Management and Tracking
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');

class Portfolio {
    constructor(data = {}) {
        this.id = data.id || uuidv4();
        this.userId = data.userId;
        this.name = data.name;
        this.description = data.description;
        this.initialCapital = data.initialCapital;
        this.currentValue = data.currentValue || 0;
        this.cashBalance = data.cashBalance || data.initialCapital || 0;
        this.totalReturn = data.totalReturn || 0;
        this.totalReturnPercentage = data.totalReturnPercentage || 0;
        this.isDefault = data.isDefault || false;
        this.currency = data.currency || 'EGP';
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    // Static methods for database operations
    static async findById(id) {
        try {
            const pool = await sql.getConnectionPool();
            const result = await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .query('SELECT * FROM Portfolios WHERE Id = @id');
            
            return result.recordset.length > 0 ? new Portfolio(result.recordset[0]) : null;
        } catch (error) {
            throw new Error(`Error finding portfolio by ID: ${error.message}`);
        }
    }

    static async findByUserId(userId) {
        try {
            const pool = await sql.getConnectionPool();
            const result = await pool.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .execute('GetUserPortfolioSummary');
            
            return result.recordset.map(portfolio => new Portfolio(portfolio));
        } catch (error) {
            throw new Error(`Error finding portfolios by user ID: ${error.message}`);
        }
    }

    static async create(portfolioData) {
        try {
            const portfolio = new Portfolio(portfolioData);
            
            const pool = await sql.getConnectionPool();
            await pool.request()
                .input('id', sql.UniqueIdentifier, portfolio.id)
                .input('userId', sql.UniqueIdentifier, portfolio.userId)
                .input('name', sql.NVarChar(100), portfolio.name)
                .input('description', sql.NVarChar(500), portfolio.description)
                .input('initialCapital', sql.Decimal(18,2), portfolio.initialCapital)
                .input('cashBalance', sql.Decimal(18,2), portfolio.cashBalance)
                .input('isDefault', sql.Bit, portfolio.isDefault)
                .input('currency', sql.NVarChar(3), portfolio.currency)
                .query(`
                    INSERT INTO Portfolios (Id, UserId, Name, Description, InitialCapital, CashBalance, IsDefault, Currency)
                    VALUES (@id, @userId, @name, @description, @initialCapital, @cashBalance, @isDefault, @currency)
                `);

            return portfolio;
        } catch (error) {
            throw new Error(`Error creating portfolio: ${error.message}`);
        }
    }

    // Get portfolio holdings
    async getHoldings() {
        try {
            const pool = await sql.getConnectionPool();
            const result = await pool.request()
                .input('portfolioId', sql.UniqueIdentifier, this.id)
                .execute('GetPortfolioHoldings');
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error getting portfolio holdings: ${error.message}`);
        }
    }

    // Get portfolio transactions
    async getTransactions(limit = 50) {
        try {
            const pool = await sql.getConnectionPool();
            const result = await pool.request()
                .input('portfolioId', sql.UniqueIdentifier, this.id)
                .input('limit', sql.Int, limit)
                .query(`
                    SELECT TOP (@limit) 
                        pt.*,
                        s.Symbol,
                        s.Name as StockName
                    FROM PortfolioTransactions pt
                    LEFT JOIN Stocks s ON pt.StockId = s.Id
                    WHERE pt.PortfolioId = @portfolioId
                    ORDER BY pt.ExecutedAt DESC
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error getting portfolio transactions: ${error.message}`);
        }
    }

    // Execute a transaction
    async executeTransaction(transactionData) {
        try {
            const pool = await sql.getConnectionPool();
            await pool.request()
                .input('portfolioId', sql.UniqueIdentifier, this.id)
                .input('stockId', sql.UniqueIdentifier, transactionData.stockId)
                .input('transactionType', sql.NVarChar(20), transactionData.transactionType)
                .input('quantity', sql.Int, transactionData.quantity)
                .input('price', sql.Decimal(18,4), transactionData.price)
                .input('amount', sql.Decimal(18,2), transactionData.amount)
                .input('fees', sql.Decimal(18,2), transactionData.fees || 0)
                .input('notes', sql.NVarChar(500), transactionData.notes)
                .execute('ExecutePortfolioTransaction');

            // Refresh portfolio data
            await this.refresh();
        } catch (error) {
            throw new Error(`Error executing transaction: ${error.message}`);
        }
    }

    // Buy stock
    async buyStock(stockId, quantity, price, fees = 0, notes = null) {
        const amount = quantity * price;
        
        // Check if enough cash
        if (this.cashBalance < amount + fees) {
            throw new Error('Insufficient cash balance');
        }

        await this.executeTransaction({
            stockId,
            transactionType: 'BUY',
            quantity,
            price,
            amount,
            fees,
            notes
        });
    }

    // Sell stock
    async sellStock(stockId, quantity, price, fees = 0, notes = null) {
        // Check if enough shares
        const holdings = await this.getHoldings();
        const holding = holdings.find(h => h.StockId === stockId);
        
        if (!holding || holding.Quantity < quantity) {
            throw new Error('Insufficient shares to sell');
        }

        const amount = quantity * price;

        await this.executeTransaction({
            stockId,
            transactionType: 'SELL',
            quantity,
            price,
            amount,
            fees,
            notes
        });
    }

    // Add cash to portfolio
    async addCash(amount, notes = 'Cash deposit') {
        await this.executeTransaction({
            transactionType: 'DEPOSIT',
            amount,
            fees: 0,
            notes
        });
    }

    // Withdraw cash from portfolio
    async withdrawCash(amount, notes = 'Cash withdrawal') {
        if (this.cashBalance < amount) {
            throw new Error('Insufficient cash balance');
        }

        await this.executeTransaction({
            transactionType: 'WITHDRAWAL',
            amount,
            fees: 0,
            notes
        });
    }

    // Update current values of all holdings
    async updateCurrentValues() {
        try {
            const pool = await sql.getConnectionPool();
            await pool.request()
                .input('portfolioId', sql.UniqueIdentifier, this.id)
                .execute('UpdatePortfolioCurrentValues');
            
            // Refresh portfolio data
            await this.refresh();
        } catch (error) {
            throw new Error(`Error updating current values: ${error.message}`);
        }
    }

    // Calculate portfolio performance
    async calculatePerformance(days = 30) {
        try {
            const pool = await sql.getConnectionPool();
            const result = await pool.request()
                .input('portfolioId', sql.UniqueIdentifier, this.id)
                .input('days', sql.Int, days)
                .query(`
                    WITH DailyValues AS (
                        SELECT 
                            CAST(pt.ExecutedAt AS DATE) as Date,
                            SUM(CASE WHEN pt.TransactionType IN ('DEPOSIT', 'SELL') THEN pt.Amount 
                                     WHEN pt.TransactionType IN ('WITHDRAWAL', 'BUY') THEN -pt.Amount 
                                     ELSE 0 END) as NetCashFlow
                        FROM PortfolioTransactions pt
                        WHERE pt.PortfolioId = @portfolioId
                            AND pt.ExecutedAt >= DATEADD(day, -@days, GETUTCDATE())
                        GROUP BY CAST(pt.ExecutedAt AS DATE)
                    )
                    SELECT 
                        COUNT(*) as TradingDays,
                        SUM(NetCashFlow) as TotalNetCashFlow,
                        AVG(NetCashFlow) as AvgDailyCashFlow
                    FROM DailyValues
                `);
            
            const performance = result.recordset[0];
            
            // Calculate additional metrics
            performance.totalReturnPercentage = this.totalReturnPercentage;
            performance.totalReturn = this.totalReturn;
            performance.currentValue = this.currentValue;
            performance.cashBalance = this.cashBalance;
            
            // Annualized return (rough calculation)
            if (days > 0 && this.initialCapital > 0) {
                const dailyReturn = (this.currentValue / this.initialCapital - 1) / days;
                performance.annualizedReturn = (Math.pow(1 + dailyReturn, 365) - 1) * 100;
            }
            
            return performance;
        } catch (error) {
            throw new Error(`Error calculating performance: ${error.message}`);
        }
    }

    // Get portfolio allocation by sector
    async getSectorAllocation() {
        try {
            const pool = await sql.getConnectionPool();
            const result = await pool.request()
                .input('portfolioId', sql.UniqueIdentifier, this.id)
                .query(`
                    SELECT 
                        s.Sector,
                        s.SectorArabic,
                        COUNT(*) as StockCount,
                        SUM(ph.CurrentValue) as TotalValue,
                        (SUM(ph.CurrentValue) / @currentValue) * 100 as AllocationPercentage
                    FROM PortfolioHoldings ph
                    INNER JOIN Stocks s ON ph.StockId = s.Id
                    WHERE ph.PortfolioId = @portfolioId
                    GROUP BY s.Sector, s.SectorArabic
                    ORDER BY TotalValue DESC
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error getting sector allocation: ${error.message}`);
        }
    }

    // Get portfolio statistics
    async getStatistics() {
        try {
            const holdings = await this.getHoldings();
            const totalHoldings = holdings.length;
            const totalInvested = holdings.reduce((sum, h) => sum + h.TotalCost, 0);
            const totalCurrentValue = holdings.reduce((sum, h) => sum + (h.CurrentValue || 0), 0);
            const totalGainLoss = holdings.reduce((sum, h) => sum + (h.UnrealizedGainLoss || 0), 0);
            
            const winningStocks = holdings.filter(h => (h.UnrealizedGainLoss || 0) > 0).length;
            const losingStocks = holdings.filter(h => (h.UnrealizedGainLoss || 0) < 0).length;
            
            return {
                totalHoldings,
                totalInvested,
                totalCurrentValue,
                totalGainLoss,
                totalGainLossPercentage: totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0,
                winningStocks,
                losingStocks,
                winRate: totalHoldings > 0 ? (winningStocks / totalHoldings) * 100 : 0,
                cashBalance: this.cashBalance,
                cashPercentage: this.currentValue > 0 ? (this.cashBalance / this.currentValue) * 100 : 0
            };
        } catch (error) {
            throw new Error(`Error getting portfolio statistics: ${error.message}`);
        }
    }

    // Refresh portfolio data from database
    async refresh() {
        const portfolio = await Portfolio.findById(this.id);
        if (portfolio) {
            Object.assign(this, portfolio);
        }
    }

    // Save portfolio
    async save() {
        try {
            const pool = await sql.getConnectionPool();
            await pool.request()
                .input('id', sql.UniqueIdentifier, this.id)
                .input('name', sql.NVarChar(100), this.name)
                .input('description', sql.NVarChar(500), this.description)
                .input('initialCapital', sql.Decimal(18,2), this.initialCapital)
                .input('isDefault', sql.Bit, this.isDefault)
                .input('currency', sql.NVarChar(3), this.currency)
                .query(`
                    UPDATE Portfolios SET 
                        Name = @name,
                        Description = @description,
                        InitialCapital = @initialCapital,
                        IsDefault = @isDefault,
                        Currency = @currency,
                        UpdatedAt = GETUTCDATE()
                    WHERE Id = @id
                `);
        } catch (error) {
            throw new Error(`Error saving portfolio: ${error.message}`);
        }
    }

    // Delete portfolio
    async delete() {
        try {
            const pool = await sql.getConnectionPool();
            await pool.request()
                .input('id', sql.UniqueIdentifier, this.id)
                .query('DELETE FROM Portfolios WHERE Id = @id');
        } catch (error) {
            throw new Error(`Error deleting portfolio: ${error.message}`);
        }
    }

    // Convert to object
    toObject() {
        return {
            id: this.id,
            userId: this.userId,
            name: this.name,
            description: this.description,
            initialCapital: this.initialCapital,
            currentValue: this.currentValue,
            cashBalance: this.cashBalance,
            totalReturn: this.totalReturn,
            totalReturnPercentage: this.totalReturnPercentage,
            isDefault: this.isDefault,
            currency: this.currency,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Portfolio;

// Stock Model - Egyptian Stock Exchange
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../../config/database');

class Stock {
    constructor(data = {}) {
        this.id = data.Id || data.id;
        this.symbol = data.Symbol || data.symbol;
        this.name = data.Name || data.name;
        this.nameArabic = data.NameArabic || data.nameArabic;
        this.sector = data.Sector || data.sector;
        this.sectorArabic = data.SectorArabic || data.sectorArabic;
        this.marketCap = data.MarketCap || data.marketCap;
        this.currency = data.Currency || data.currency || 'EGP';
        this.exchange = data.Exchange || data.exchange;
        this.isActive = data.IsActive !== undefined ? data.IsActive : data.isActive;
        this.listedDate = data.ListedDate || data.listedDate;
        this.createdAt = data.CreatedAt || data.createdAt;
        this.updatedAt = data.UpdatedAt || data.updatedAt;
    }

    // Convert to JSON for API responses
    toJSON() {
        return {
            id: this.id,
            symbol: this.symbol,
            name: this.name,
            nameArabic: this.nameArabic,
            sector: this.sector,
            sectorArabic: this.sectorArabic,
            marketCap: this.marketCap,
            currency: this.currency,
            exchange: this.exchange,
            isActive: this.isActive,
            listedDate: this.listedDate,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // Find stock by symbol
    static async findBySymbol(symbol) {
        try {
            const pool = getDatabase();
            const result = await pool.request()
                .input('symbol', sql.NVarChar, symbol.toUpperCase())
                .query(`
                    SELECT * FROM Stocks 
                    WHERE Symbol = @symbol AND IsActive = 1
                `);

            if (result.recordset.length === 0) {
                return null;
            }

            return new Stock(result.recordset[0]);
        } catch (error) {
            throw new Error(`Error finding stock by symbol: ${error.message}`);
        }
    }

    // Find all stocks with filters
    static async findAll(options = {}) {
        try {
            const {
                filters = {},
                limit = 20,
                offset = 0,
                orderBy = 'Symbol ASC'
            } = options;

            const pool = getDatabase();
            let query = 'SELECT * FROM Stocks WHERE 1=1';
            const request = pool.request();

            // Add filters
            if (filters.isActive !== undefined) {
                query += ' AND IsActive = @isActive';
                request.input('isActive', sql.Bit, filters.isActive);
            }

            if (filters.sector) {
                query += ' AND Sector = @sector';
                request.input('sector', sql.NVarChar, filters.sector);
            }

            if (filters.exchange) {
                query += ' AND Exchange = @exchange';
                request.input('exchange', sql.NVarChar, filters.exchange);
            }

            // Add ordering and pagination
            query += ` ORDER BY ${orderBy} OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
            request.input('offset', sql.Int, offset);
            request.input('limit', sql.Int, limit);

            const result = await request.query(query);
            return result.recordset.map(row => new Stock(row));

        } catch (error) {
            throw new Error(`Error finding stocks: ${error.message}`);
        }
    }

    // Get all sectors
    static async getSectors() {
        try {
            const pool = getDatabase();
            const result = await pool.request().query(`
                SELECT DISTINCT Sector, COUNT(*) as StockCount
                FROM Stocks 
                WHERE IsActive = 1 AND Sector IS NOT NULL
                GROUP BY Sector
                ORDER BY Sector
            `);

            return result.recordset;
        } catch (error) {
            throw new Error(`Error getting sectors: ${error.message}`);
        }
    }

    // Search stocks
    static async search(searchQuery, limit = 10) {
        try {
            const pool = getDatabase();
            const result = await pool.request()
                .input('query', sql.NVarChar, `%${searchQuery}%`)
                .input('limit', sql.Int, limit)
                .query(`
                    SELECT TOP(@limit) * FROM Stocks 
                    WHERE IsActive = 1 AND (
                        Symbol LIKE @query OR 
                        Name LIKE @query OR 
                        NameArabic LIKE @query
                    )
                    ORDER BY Symbol
                `);

            return result.recordset.map(row => new Stock(row));
        } catch (error) {
            throw new Error(`Error searching stocks: ${error.message}`);
        }
    }

    // Get stock price data
    static async getStockData(symbol, options = {}) {
        try {
            const {
                timeframe = '1d',
                days = 30
            } = options;

            const pool = getDatabase();
            
            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - days);

            const result = await pool.request()
                .input('symbol', sql.NVarChar, symbol.toUpperCase())
                .input('timeframe', sql.NVarChar, timeframe)
                .input('startDate', sql.Date, startDate)
                .input('endDate', sql.Date, endDate)
                .query(`
                    SELECT 
                        Date, TimeFrame, [Open], [High], [Low], [Close], Volume,
                        AdjustedClose, CreatedAt
                    FROM StockData sd
                    INNER JOIN Stocks s ON sd.StockId = s.Id
                    WHERE s.Symbol = @symbol 
                        AND sd.TimeFrame = @timeframe
                        AND sd.Date >= @startDate 
                        AND sd.Date <= @endDate
                    ORDER BY sd.Date DESC
                `);

            return result.recordset;
        } catch (error) {
            throw new Error(`Error getting stock data: ${error.message}`);
        }
    }

    // Save stock to database
    async save() {
        try {
            const pool = getDatabase();
            
            if (this.id) {
                // Update existing stock
                await pool.request()
                    .input('id', sql.UniqueIdentifier, this.id)
                    .input('symbol', sql.NVarChar, this.symbol)
                    .input('companyName', sql.NVarChar, this.companyName)
                    .input('companyNameAr', sql.NVarChar, this.companyNameAr)
                    .input('sector', sql.NVarChar, this.sector)
                    .input('market', sql.NVarChar, this.market)
                    .input('currency', sql.NVarChar, this.currency)
                    .input('isActive', sql.Bit, this.isActive)
                    .query(`
                        UPDATE Stocks SET
                            Symbol = @symbol,
                            CompanyName = @companyName,
                            CompanyNameAr = @companyNameAr,
                            Sector = @sector,
                            Market = @market,
                            Currency = @currency,
                            IsActive = @isActive,
                            UpdatedAt = GETUTCDATE()
                        WHERE Id = @id
                    `);
            } else {
                // Insert new stock
                this.id = uuidv4();
                await pool.request()
                    .input('id', sql.UniqueIdentifier, this.id)
                    .input('symbol', sql.NVarChar, this.symbol)
                    .input('companyName', sql.NVarChar, this.companyName)
                    .input('companyNameAr', sql.NVarChar, this.companyNameAr)
                    .input('sector', sql.NVarChar, this.sector)
                    .input('market', sql.NVarChar, this.market)
                    .input('currency', sql.NVarChar, this.currency)
                    .input('isActive', sql.Bit, this.isActive)
                    .query(`
                        INSERT INTO Stocks (Id, Symbol, CompanyName, CompanyNameAr, Sector, Market, Currency, IsActive)
                        VALUES (@id, @symbol, @companyName, @companyNameAr, @sector, @market, @currency, @isActive)
                    `);
            }
            
            return this;
        } catch (error) {
            throw new Error(`Error saving stock: ${error.message}`);
        }
    }
}

module.exports = Stock;
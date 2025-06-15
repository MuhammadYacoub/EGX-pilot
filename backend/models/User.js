// User Model - Authentication and User Management
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
    constructor(data = {}) {
        this.id = data.id || uuidv4();
        this.email = data.email;
        this.passwordHash = data.passwordHash;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.phoneNumber = data.phoneNumber;
        this.isEmailVerified = data.isEmailVerified || false;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.role = data.role || 'USER';
        this.subscriptionType = data.subscriptionType || 'FREE';
        this.subscriptionExpiresAt = data.subscriptionExpiresAt;
        this.preferences = data.preferences || {};
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.lastLoginAt = data.lastLoginAt;
    }

    // Static methods for database operations
    static async findById(id) {
        try {
            const pool = await sql.getConnectionPool();
            const result = await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .query('SELECT * FROM Users WHERE Id = @id AND IsActive = 1');
            
            return result.recordset.length > 0 ? new User(result.recordset[0]) : null;
        } catch (error) {
            throw new Error(`Error finding user by ID: ${error.message}`);
        }
    }

    static async findByEmail(email) {
        try {
            const pool = await sql.getConnectionPool();
            const result = await pool.request()
                .input('email', sql.NVarChar(255), email)
                .query('SELECT * FROM Users WHERE Email = @email AND IsActive = 1');
            
            return result.recordset.length > 0 ? new User(result.recordset[0]) : null;
        } catch (error) {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    static async create(userData) {
        try {
            // Hash password
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(userData.password, saltRounds);
            
            const user = new User({
                ...userData,
                passwordHash,
                preferences: JSON.stringify(userData.preferences || {})
            });

            const pool = await sql.getConnectionPool();
            await pool.request()
                .input('id', sql.UniqueIdentifier, user.id)
                .input('email', sql.NVarChar(255), user.email)
                .input('passwordHash', sql.NVarChar(255), user.passwordHash)
                .input('firstName', sql.NVarChar(100), user.firstName)
                .input('lastName', sql.NVarChar(100), user.lastName)
                .input('phoneNumber', sql.NVarChar(20), user.phoneNumber)
                .input('role', sql.NVarChar(20), user.role)
                .input('subscriptionType', sql.NVarChar(20), user.subscriptionType)
                .input('preferences', sql.NVarChar(sql.MAX), JSON.stringify(user.preferences))
                .query(`
                    INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, PhoneNumber, Role, SubscriptionType, Preferences)
                    VALUES (@id, @email, @passwordHash, @firstName, @lastName, @phoneNumber, @role, @subscriptionType, @preferences)
                `);

            return user;
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    async save() {
        try {
            const pool = await sql.getConnectionPool();
            await pool.request()
                .input('id', sql.UniqueIdentifier, this.id)
                .input('email', sql.NVarChar(255), this.email)
                .input('firstName', sql.NVarChar(100), this.firstName)
                .input('lastName', sql.NVarChar(100), this.lastName)
                .input('phoneNumber', sql.NVarChar(20), this.phoneNumber)
                .input('isEmailVerified', sql.Bit, this.isEmailVerified)
                .input('isActive', sql.Bit, this.isActive)
                .input('role', sql.NVarChar(20), this.role)
                .input('subscriptionType', sql.NVarChar(20), this.subscriptionType)
                .input('subscriptionExpiresAt', sql.DateTime2, this.subscriptionExpiresAt)
                .input('preferences', sql.NVarChar(sql.MAX), JSON.stringify(this.preferences))
                .input('lastLoginAt', sql.DateTime2, this.lastLoginAt)
                .query(`
                    UPDATE Users SET 
                        Email = @email,
                        FirstName = @firstName,
                        LastName = @lastName,
                        PhoneNumber = @phoneNumber,
                        IsEmailVerified = @isEmailVerified,
                        IsActive = @isActive,
                        Role = @role,
                        SubscriptionType = @subscriptionType,
                        SubscriptionExpiresAt = @subscriptionExpiresAt,
                        Preferences = @preferences,
                        LastLoginAt = @lastLoginAt,
                        UpdatedAt = GETUTCDATE()
                    WHERE Id = @id
                `);
        } catch (error) {
            throw new Error(`Error saving user: ${error.message}`);
        }
    }

    async verifyPassword(password) {
        return await bcrypt.compare(password, this.passwordHash);
    }

    async updatePassword(newPassword) {
        const saltRounds = 12;
        this.passwordHash = await bcrypt.hash(newPassword, saltRounds);
        await this.save();
    }

    async updateLastLogin() {
        this.lastLoginAt = new Date();
        await this.save();
    }

    // Get user's portfolios
    async getPortfolios() {
        try {
            const pool = await sql.getConnectionPool();
            const result = await pool.request()
                .input('userId', sql.UniqueIdentifier, this.id)
                .execute('GetUserPortfolioSummary');
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error getting user portfolios: ${error.message}`);
        }
    }

    // Get user's active alerts
    async getActiveAlerts() {
        try {
            const pool = await sql.getConnectionPool();
            const result = await pool.request()
                .input('userId', sql.UniqueIdentifier, this.id)
                .execute('GetUserActiveAlerts');
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error getting user alerts: ${error.message}`);
        }
    }

    // Check if user has premium features
    hasFeature(feature) {
        const featureMap = {
            'basic_analysis': ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
            'advanced_analysis': ['PREMIUM', 'ENTERPRISE'],
            'real_time_data': ['BASIC', 'PREMIUM', 'ENTERPRISE'],
            'portfolio_tracking': ['BASIC', 'PREMIUM', 'ENTERPRISE'],
            'alerts': ['PREMIUM', 'ENTERPRISE'],
            'api_access': ['ENTERPRISE'],
            'custom_strategies': ['ENTERPRISE']
        };

        return featureMap[feature]?.includes(this.subscriptionType) || false;
    }

    // Convert to safe object (exclude sensitive data)
    toSafeObject() {
        return {
            id: this.id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            phoneNumber: this.phoneNumber,
            isEmailVerified: this.isEmailVerified,
            role: this.role,
            subscriptionType: this.subscriptionType,
            subscriptionExpiresAt: this.subscriptionExpiresAt,
            preferences: this.preferences,
            createdAt: this.createdAt,
            lastLoginAt: this.lastLoginAt
        };
    }
}

module.exports = User;

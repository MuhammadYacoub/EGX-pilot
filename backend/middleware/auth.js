// Authentication Middleware and JWT Management
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sql = require('mssql');
const User = require('../models/User');
const logger = require('../utils/logger');
const config = require('../../config/environment');

class AuthService {
    constructor() {
        this.jwtSecret = config.jwt.secret;
        this.jwtExpiresIn = config.jwt.expiresIn;
    }

    // Generate JWT token
    generateToken(payload) {
        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiresIn,
            issuer: 'EGXpilot',
            audience: 'EGXpilot-users'
        });
    }

    // Verify JWT token
    async verifyToken(token) {
        try {
            const decoded = await promisify(jwt.verify)(token, this.jwtSecret);
            return decoded;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    // Create user session
    async createSession(user, deviceInfo = null, ipAddress = null) {
        try {
            const payload = {
                userId: user.id,
                email: user.email,
                role: user.role,
                subscriptionType: user.subscriptionType
            };

            const token = this.generateToken(payload);
            const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
            
            // Calculate expiration time
            const expiresAt = new Date();
            expiresAt.setTime(expiresAt.getTime() + (24 * 60 * 60 * 1000)); // 24 hours

            // Store session in database
            const pool = await sql.getConnectionPool();
            await pool.request()
                .input('userId', sql.UniqueIdentifier, user.id)
                .input('tokenHash', sql.NVarChar(255), tokenHash)
                .input('deviceInfo', sql.NVarChar(500), deviceInfo)
                .input('ipAddress', sql.NVarChar(45), ipAddress)
                .input('expiresAt', sql.DateTime2, expiresAt)
                .query(`
                    INSERT INTO UserSessions (UserId, TokenHash, DeviceInfo, IpAddress, ExpiresAt)
                    VALUES (@userId, @tokenHash, @deviceInfo, @ipAddress, @expiresAt)
                `);

            // Update user last login
            await user.updateLastLogin();

            return { token, expiresAt };
        } catch (error) {
            logger.error('Error creating session:', error);
            throw new Error('Failed to create session');
        }
    }

    // Validate session
    async validateSession(token) {
        try {
            const decoded = await this.verifyToken(token);
            const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');

            const pool = await sql.getConnectionPool();
            const result = await pool.request()
                .input('tokenHash', sql.NVarChar(255), tokenHash)
                .query(`
                    SELECT s.*, u.IsActive as UserIsActive
                    FROM UserSessions s
                    INNER JOIN Users u ON s.UserId = u.Id
                    WHERE s.TokenHash = @tokenHash 
                        AND s.IsActive = 1 
                        AND s.ExpiresAt > GETUTCDATE()
                        AND u.IsActive = 1
                `);

            if (result.recordset.length === 0) {
                throw new Error('Session not found or expired');
            }

            const session = result.recordset[0];
            const user = await User.findById(session.UserId);

            if (!user) {
                throw new Error('User not found');
            }

            return { user, session };
        } catch (error) {
            logger.error('Error validating session:', error);
            throw new Error('Invalid session');
        }
    }

    // Logout (invalidate session)
    async logout(token) {
        try {
            const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');

            const pool = await sql.getConnectionPool();
            await pool.request()
                .input('tokenHash', sql.NVarChar(255), tokenHash)
                .query(`
                    UPDATE UserSessions 
                    SET IsActive = 0 
                    WHERE TokenHash = @tokenHash
                `);

            return true;
        } catch (error) {
            logger.error('Error during logout:', error);
            throw new Error('Failed to logout');
        }
    }

    // Logout all sessions for a user
    async logoutAllSessions(userId) {
        try {
            const pool = await sql.getConnectionPool();
            await pool.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .query(`
                    UPDATE UserSessions 
                    SET IsActive = 0 
                    WHERE UserId = @userId
                `);

            return true;
        } catch (error) {
            logger.error('Error during logout all sessions:', error);
            throw new Error('Failed to logout all sessions');
        }
    }

    // Clean expired sessions
    async cleanExpiredSessions() {
        try {
            const pool = await sql.getConnectionPool();
            const result = await pool.request()
                .query(`
                    DELETE FROM UserSessions 
                    WHERE ExpiresAt < GETUTCDATE() OR IsActive = 0
                `);

            logger.info(`Cleaned ${result.rowsAffected} expired sessions`);
            return result.rowsAffected;
        } catch (error) {
            logger.error('Error cleaning expired sessions:', error);
            throw new Error('Failed to clean expired sessions');
        }
    }

    // Get user active sessions
    async getUserSessions(userId) {
        try {
            const pool = await sql.getConnectionPool();
            const result = await pool.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .query(`
                    SELECT Id, DeviceInfo, IpAddress, CreatedAt, ExpiresAt
                    FROM UserSessions 
                    WHERE UserId = @userId 
                        AND IsActive = 1 
                        AND ExpiresAt > GETUTCDATE()
                    ORDER BY CreatedAt DESC
                `);

            return result.recordset;
        } catch (error) {
            logger.error('Error getting user sessions:', error);
            throw new Error('Failed to get user sessions');
        }
    }

    // Refresh token (extend expiration)
    async refreshToken(token) {
        try {
            const { user } = await this.validateSession(token);
            
            // Create new token
            const payload = {
                userId: user.id,
                email: user.email,
                role: user.role,
                subscriptionType: user.subscriptionType
            };

            const newToken = this.generateToken(payload);
            const newTokenHash = require('crypto').createHash('sha256').update(newToken).digest('hex');
            const oldTokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
            
            // Calculate new expiration time
            const expiresAt = new Date();
            expiresAt.setTime(expiresAt.getTime() + (24 * 60 * 60 * 1000)); // 24 hours

            // Update session with new token
            const pool = await sql.getConnectionPool();
            await pool.request()
                .input('oldTokenHash', sql.NVarChar(255), oldTokenHash)
                .input('newTokenHash', sql.NVarChar(255), newTokenHash)
                .input('expiresAt', sql.DateTime2, expiresAt)
                .query(`
                    UPDATE UserSessions 
                    SET TokenHash = @newTokenHash, ExpiresAt = @expiresAt
                    WHERE TokenHash = @oldTokenHash AND IsActive = 1
                `);

            return { token: newToken, expiresAt };
        } catch (error) {
            logger.error('Error refreshing token:', error);
            throw new Error('Failed to refresh token');
        }
    }
}

// Middleware functions
const authService = new AuthService();

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token required',
                messageArabic: 'مطلوب رمز الوصول'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const { user, session } = await authService.validateSession(token);

        req.user = user;
        req.session = session;
        req.token = token;
        
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            messageArabic: 'رمز غير صحيح أو منتهي الصلاحية'
        });
    }
};

// Authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                messageArabic: 'المصادقة مطلوبة'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                messageArabic: 'صلاحيات غير كافية'
            });
        }

        next();
    };
};

// Subscription feature middleware
const requireFeature = (feature) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                messageArabic: 'المصادقة مطلوبة'
            });
        }

        if (!req.user.hasFeature(feature)) {
            return res.status(403).json({
                success: false,
                message: 'Feature not available in your subscription plan',
                messageArabic: 'هذه الميزة غير متاحة في خطة اشتراكك',
                requiredFeature: feature,
                userSubscription: req.user.subscriptionType
            });
        }

        next();
    };
};

// Optional authentication (for endpoints that work with or without auth)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { user, session } = await authService.validateSession(token);
            req.user = user;
            req.session = session;
            req.token = token;
        }
        
        next();
    } catch (error) {
        // Silently continue without authentication
        next();
    }
};

module.exports = {
    AuthService,
    authService,
    authenticate,
    authorize,
    requireFeature,
    optionalAuth
};

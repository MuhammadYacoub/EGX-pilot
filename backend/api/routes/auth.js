// Authentication API Routes
const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const User = require('../../models/User');
const { authService, authenticate, optionalAuth } = require('../../middleware/auth');
const logger = require('../../utils/logger');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const { sendSuccess, sendError } = require('../../utils/responseHandler');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later',
        messageArabic: 'محاولات مصادقة كثيرة جداً، يرجى المحاولة مرة أخرى لاحقاً'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 registration attempts per hour
    message: {
        success: false,
        message: 'Too many registration attempts, please try again later',
        messageArabic: 'محاولات تسجيل كثيرة جداً، يرجى المحاولة مرة أخرى لاحقاً'
    }
});

/**
 * @route   POST api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', [registerLimiter, validate(registerSchema)], async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return sendError(res, 409, 'User with this email already exists', 'يوجد مستخدم بهذا البريد الإلكتروني بالفعل');
        }

        // Create new user
        const userData = {
            email,
            password,
            firstName,
            lastName,
            role: 'USER',
            subscriptionType: 'FREE'
        };

        const user = await User.create(userData);

        // Create session
        const deviceInfo = req.headers['user-agent'];
        const ipAddress = req.ip || req.connection.remoteAddress;
        const session = await authService.createSession(user, deviceInfo, ipAddress);

        logger.info(`New user registered: ${email}`);

        const responseData = {
            user: user.toSafeObject(),
            token: session.token,
            expiresAt: session.expiresAt
        };

        return sendSuccess(res, 201, responseData, 'User registered successfully', 'تم تسجيل المستخدم بنجاح');

    } catch (error) {
        logger.error('Registration error:', error);
        const errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
        return sendError(res, 500, 'Registration failed', 'فشل في التسجيل', errorMessage);
    }
});

/**
 * @route   POST api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', [authLimiter, validate(loginSchema)], async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return sendError(res, 401, 'Invalid email or password', 'بريد إلكتروني أو كلمة مرور غير صحيحة');
        }

        // Verify password
        const isValidPassword = await user.verifyPassword(password);
        if (!isValidPassword) {
            return sendError(res, 401, 'Invalid email or password', 'بريد إلكتروني أو كلمة مرور غير صحيحة');
        }

        // Check if user is active
        if (!user.isActive) {
            return sendError(res, 403, 'Account is deactivated', 'الحساب معطل');
        }

        // Create session
        const deviceInfo = req.headers['user-agent'];
        const ipAddress = req.ip || req.connection.remoteAddress;
        const session = await authService.createSession(user, deviceInfo, ipAddress);

        logger.info(`User logged in: ${email}`);

        const responseData = {
            user: user.toSafeObject(),
            token: session.token,
            expiresAt: session.expiresAt
        };

        return sendSuccess(res, 200, responseData, 'Login successful', 'تم تسجيل الدخول بنجاح');

    } catch (error) {
        logger.error('Login error:', error);
        const errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
        return sendError(res, 500, 'Login failed', 'فشل في تسجيل الدخول', errorMessage);
    }
});

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
    try {
        // Get updated user data
        const user = await User.findById(req.user.id);
        if (!user) {
            return sendError(res, 404, 'User not found', 'المستخدم غير موجود');
        }

        return sendSuccess(res, 200, { user: user.toSafeObject() });

    } catch (error) {
        logger.error('Get profile error:', error);
        return sendError(res, 500, 'Failed to get profile', 'فشل في الحصول على الملف الشخصي');
    }
});

// Logout user
router.post('/logout', authenticate, async (req, res) => {
    try {
        await authService.logout(req.token);

        logger.info(`User logged out: ${req.user.email}`);

        return sendSuccess(res, 200, null, 'Logout successful', 'تم تسجيل الخروج بنجاح');

    } catch (error) {
        logger.error('Logout error:', error);
        return sendError(res, 500, 'Logout failed', 'فشل في تسجيل الخروج');
    }
});

module.exports = router;
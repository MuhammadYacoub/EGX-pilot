// Authentication API Routes
const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../../models/User');
const { authService, authenticate, optionalAuth } = require('../../middleware/auth');
const logger = require('../../utils/logger');

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

// Validation rules
const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('phoneNumber')
        .optional()
        .isMobilePhone('ar-EG')
        .withMessage('Please provide a valid Egyptian phone number')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Register new user
router.post('/register', registerLimiter, registerValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                messageArabic: 'فشل في التحقق من البيانات',
                errors: errors.array()
            });
        }

        const { email, password, firstName, lastName, phoneNumber } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists',
                messageArabic: 'يوجد مستخدم بهذا البريد الإلكتروني بالفعل'
            });
        }

        // Create new user
        const userData = {
            email,
            password,
            firstName,
            lastName,
            phoneNumber,
            role: 'USER',
            subscriptionType: 'FREE'
        };

        const user = await User.create(userData);

        // Create session
        const deviceInfo = req.headers['user-agent'];
        const ipAddress = req.ip || req.connection.remoteAddress;
        const session = await authService.createSession(user, deviceInfo, ipAddress);

        logger.info(`New user registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            messageArabic: 'تم تسجيل المستخدم بنجاح',
            data: {
                user: user.toSafeObject(),
                token: session.token,
                expiresAt: session.expiresAt
            }
        });

    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            messageArabic: 'فشل في التسجيل',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Login user
router.post('/login', authLimiter, loginValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                messageArabic: 'فشل في التحقق من البيانات',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                messageArabic: 'بريد إلكتروني أو كلمة مرور غير صحيحة'
            });
        }

        // Verify password
        const isValidPassword = await user.verifyPassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                messageArabic: 'بريد إلكتروني أو كلمة مرور غير صحيحة'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated',
                messageArabic: 'الحساب معطل'
            });
        }

        // Create session
        const deviceInfo = req.headers['user-agent'];
        const ipAddress = req.ip || req.connection.remoteAddress;
        const session = await authService.createSession(user, deviceInfo, ipAddress);

        logger.info(`User logged in: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            messageArabic: 'تم تسجيل الدخول بنجاح',
            data: {
                user: user.toSafeObject(),
                token: session.token,
                expiresAt: session.expiresAt
            }
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            messageArabic: 'فشل في تسجيل الدخول',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
    try {
        // Get updated user data
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                messageArabic: 'المستخدم غير موجود'
            });
        }

        res.json({
            success: true,
            data: {
                user: user.toSafeObject()
            }
        });

    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            messageArabic: 'فشل في الحصول على الملف الشخصي'
        });
    }
});

// Logout user
router.post('/logout', authenticate, async (req, res) => {
    try {
        await authService.logout(req.token);

        logger.info(`User logged out: ${req.user.email}`);

        res.json({
            success: true,
            message: 'Logout successful',
            messageArabic: 'تم تسجيل الخروج بنجاح'
        });

    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            messageArabic: 'فشل في تسجيل الخروج'
        });
    }
});

module.exports = router;
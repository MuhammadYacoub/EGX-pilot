const request = require('supertest');
const { app } = require('../../backend/server'); // Adjust path to your app
const User = require('../../backend/models/User');
const { authService } = require('../../backend/middleware/auth');

// Mock the User model to prevent actual database calls
jest.mock('../../backend/models/User');

// Mock the authService to prevent actual session/JWT creation
jest.mock('../../backend/middleware/auth', () => ({
    ...jest.requireActual('../../backend/middleware/auth'), // Import and retain other exports
    authService: {
        createSession: jest.fn(),
    },
    authenticate: (req, res, next) => next(), // Mock authenticate middleware
}));

describe('Auth Routes', () => {

    beforeEach(() => {
        // Clear all mocks before each test
        User.findByEmail.mockClear();
        User.create.mockClear();
        authService.createSession.mockClear();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            // Arrange
            User.findByEmail.mockResolvedValue(null); // No existing user
            User.create.mockResolvedValue({ id: '123', toSafeObject: () => ({ id: '123', email: 'test@example.com' }) });
            authService.createSession.mockResolvedValue({ token: 'fake-token' });

            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'Password123!'
            };

            // Act
            const res = await request(app)
                .post('/api/auth/register')
                .send(userData);

            // Assert
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBe('fake-token');
            expect(User.create).toHaveBeenCalledTimes(1);
        });

        it('should return 409 if email already exists', async () => {
            // Arrange
            User.findByEmail.mockResolvedValue({ id: '123', email: 'test@example.com' }); // User exists

            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'Password123!'
            };

            // Act
            const res = await request(app)
                .post('/api/auth/register')
                .send(userData);

            // Assert
            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('User with this email already exists');
        });

        it('should return 400 for invalid registration data', async () => {
            // Act: Send request with missing password
            const res = await request(app)
                .post('/api/auth/register')
                .send({ 
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                });

            // Assert
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid input data');
            expect(res.body.errors[0].path).toEqual(['password']);
        });
    });

    // We can add describe blocks for login, /me, and logout as well
});

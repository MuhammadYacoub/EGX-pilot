const { sendSuccess, sendError } = require('../../backend/utils/responseHandler');

describe('Response Handler Unit Tests', () => {
    let mockResponse;

    beforeEach(() => {
        // Reset the mock response object before each test
        mockResponse = {
            status: jest.fn().mockReturnThis(), // mockReturnThis allows chaining e.g., res.status().json()
            json: jest.fn(),
        };
    });

    describe('sendSuccess', () => {
        it('should send a success response with data and correct status code', () => {
            const data = { user: 'test' };
            sendSuccess(mockResponse, 201, data, 'Created', 'تم الإنشاء');

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Created',
                messageArabic: 'تم الإنشاء',
                data: data,
            });
        });

        it('should send a success response without data', () => {
            sendSuccess(mockResponse, 200, null, 'OK', 'موافق');

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'OK',
                messageArabic: 'موافق',
            });
        });
    });

    describe('sendError', () => {
        it('should send an error response with an errors array', () => {
            const errors = [{ field: 'password', message: 'is weak' }];
            sendError(mockResponse, 400, 'Bad Request', 'طلب غير صالح', errors);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Bad Request',
                messageArabic: 'طلب غير صالح',
                errors: errors,
            });
        });

        it('should send an error response without an errors array', () => {
            sendError(mockResponse, 404, 'Not Found', 'غير موجود');

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Not Found',
                messageArabic: 'غير موجود',
            });
        });
    });
});

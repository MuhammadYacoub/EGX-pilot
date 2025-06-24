/**
 * Standardized API Response Handler
 */

/**
 * Sends a standardized success response.
 * @param {object} res - The Express response object.
 * @param {number} statusCode - The HTTP status code.
 * @param {object} [data=null] - The payload/data to send.
 * @param {string} [message='Success'] - The success message.
 * @param {string} [messageArabic='نجاح'] - The success message in Arabic.
 */
const sendSuccess = (res, statusCode, data = null, message = 'Success', messageArabic = 'نجاح') => {
    const response = {
        success: true,
        message,
        messageArabic,
    };
    if (data) {
        response.data = data;
    }
    return res.status(statusCode).json(response);
};

/**
 * Sends a standardized error response.
 * @param {object} res - The Express response object.
 * @param {number} statusCode - The HTTP status code.
 * @param {string} message - The error message.
 * @param {string} messageArabic - The error message in Arabic.
 * @param {Array|object} [errors=null] - Optional detailed errors array or object.
 */
const sendError = (res, statusCode, message, messageArabic, errors = null) => {
    const response = {
        success: false,
        message,
        messageArabic,
    };
    if (errors) {
        response.errors = errors;
    }
    return res.status(statusCode).json(response);
};

module.exports = {
    sendSuccess,
    sendError,
};

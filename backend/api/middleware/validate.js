const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorDetails = error.details.map((detail) => ({
            message: detail.message,
            path: detail.path,
        }));

        return res.status(400).json({
            success: false,
            message: 'Invalid input data',
            messageArabic: 'بيانات الإدخال غير صالحة',
            errors: errorDetails,
        });
    }

    return next();
};

module.exports = validate;

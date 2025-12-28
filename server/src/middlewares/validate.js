/**
 * Zod validation middleware
 * Validates request body, params, and query against a Zod schema
 */
export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                params: req.params,
                query: req.query
            });
            next();
        } catch (error) {
            const errors = error.errors?.map(err => ({
                field: err.path.join('.'),
                message: err.message
            })) || [{ message: error.message }];

            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }
    };
};

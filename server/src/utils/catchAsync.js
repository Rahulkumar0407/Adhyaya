/**
 * Catch async errors and pass to error middleware
 */
export const catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

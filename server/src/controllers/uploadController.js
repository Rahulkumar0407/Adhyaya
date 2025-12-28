import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const uploadFile = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('Please provide a file to upload', 400));
    }

    res.status(200).json({
        status: 'success',
        data: {
            url: req.file.path,
            publicId: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size
        }
    });
});

export const uploadMultipleFiles = catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next(new AppError('Please provide files to upload', 400));
    }

    const files = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
        mimetype: file.mimetype,
        size: file.size
    }));

    res.status(200).json({
        status: 'success',
        results: files.length,
        data: { files }
    });
});

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for various types
// Check if Cloudinary is configured
const isCloudinaryConfigured = false; // FORCED FALSE FOR DEBUGGING
// process.env.CLOUDINARY_CLOUD_NAME &&
// process.env.CLOUDINARY_API_KEY &&
// process.env.CLOUDINARY_API_SECRET;

let storage;

if (isCloudinaryConfigured) {
    console.log('Using Cloudinary Storage');
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: async (req, file) => {
            let folder = 'babua-lms/others';
            let resource_type = 'auto';

            if (file.mimetype.startsWith('image/')) {
                folder = 'babua-lms/images';
                resource_type = 'image';
            } else if (file.mimetype.startsWith('video/')) {
                folder = 'babua-lms/videos';
                resource_type = 'video';
            } else if (file.mimetype === 'application/pdf') {
                folder = 'babua-lms/docs';
                resource_type = 'raw';
            }

            return {
                folder: folder,
                resource_type: resource_type,
                public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
            };
        },
    });
} else {
    console.log('Using Local Disk Storage (Cloudinary missing)');
    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
        }
    });
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept common types
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/webp',
            'video/mp4', 'video/webm',
            'application/pdf'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, WEBP, MP4, WEBM, and PDF are allowed.'), false);
        }
    }
});

export default upload;

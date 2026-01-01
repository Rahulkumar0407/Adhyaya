import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configure storage for various types
const storage = new CloudinaryStorage({
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

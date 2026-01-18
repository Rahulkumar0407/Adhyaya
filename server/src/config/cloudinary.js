import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const cloudConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};

console.log('Cloudinary Config Check:', {
    cloud_name: cloudConfig.cloud_name ? 'Set' : 'Missing',
    api_key: cloudConfig.api_key ? 'Set' : 'Missing',
    api_secret: cloudConfig.api_secret ? 'Set' : 'Missing'
});

cloudinary.config(cloudConfig);

export default cloudinary;

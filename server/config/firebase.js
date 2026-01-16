import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Firebase Admin with service account
// Use FIREBASE_SERVICE_ACCOUNT env variable containing the JSON content
if (!admin.apps.length) {
    try {
        const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccountRaw) {
            const serviceAccount = JSON.parse(serviceAccountRaw);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin initialized successfully');
        } else {
            console.warn('FIREBASE_SERVICE_ACCOUNT not found in environment variables. Firebase Auth features will not work.');
        }
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
    }
}

export default admin;

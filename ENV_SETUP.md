# Environment Variables Setup Guide

## Server `.env` File

Create a `.env` file in the `server/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/babua-lms
# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/babua-lms?retryWrites=true&w=majority

# JWT Secrets (IMPORTANT: Change these in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production-min-32-chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Session Secret (for OAuth)
SESSION_SECRET=your-session-secret-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Google OAuth 2.0 Credentials
# Get these from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL for OAuth redirect
FRONTEND_URL=http://localhost:5173
```

## How to Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (for development)
     - `https://yourdomain.com/api/auth/google/callback` (for production)
   - Copy the Client ID and Client Secret
5. Add them to your `.env` file

## Client Environment Variables

Create a `.env` file in the `client/` directory (optional, defaults are set):

```env
VITE_API_URL=http://localhost:5000
```

## Production Checklist

- [ ] Change all JWT secrets to strong, random strings (minimum 32 characters)
- [ ] Update `CLIENT_URL` and `FRONTEND_URL` to your production domain
- [ ] Update `GOOGLE_CALLBACK_URL` to your production callback URL
- [ ] Add production callback URL to Google Cloud Console
- [ ] Set `NODE_ENV=production`
- [ ] Use secure MongoDB connection string
- [ ] Enable HTTPS in production

## Security Notes

- Never commit `.env` files to version control
- Use different secrets for development and production
- Rotate secrets periodically
- Keep your Google OAuth credentials secure


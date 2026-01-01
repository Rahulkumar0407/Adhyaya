# Google OAuth Setup Complete! 🎉

## What's Been Implemented

### Backend Changes
1. ✅ Added Passport.js and Google OAuth strategy
2. ✅ Updated User model to support Google OAuth (googleId field, optional password)
3. ✅ Created OAuth routes (`/api/auth/google` and `/api/auth/google/callback`)
4. ✅ Added express-session for OAuth flow

### Frontend Changes
1. ✅ Added "Continue with Google" button to Login page
2. ✅ Added "Continue with Google" button to Register page
3. ✅ Created OAuth callback handler page
4. ✅ Updated AuthContext to handle OAuth tokens

## Installation Steps

### 1. Install Dependencies

```bash
cd server
npm install passport passport-google-oauth20 express-session
```

### 2. Set Up Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API (or Google Identity API)
4. Go to "APIs & Services" > "Credentials"
5. Click "Create Credentials" > "OAuth client ID"
6. Choose "Web application"
7. Add Authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`
8. Copy Client ID and Client Secret

### 3. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
# ... existing variables ...

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your-session-secret-key
```

### 4. Start the Server

```bash
cd server
npm run dev
```

## How It Works

1. User clicks "Continue with Google" on Login/Register page
2. User is redirected to Google's OAuth consent screen
3. After authorization, Google redirects back to `/api/auth/google/callback`
4. Server creates/updates user account and generates JWT tokens
5. User is redirected to frontend with tokens in URL
6. Frontend callback page extracts tokens and stores them
7. User is logged in and redirected to dashboard

## Features

- ✅ Automatic account creation for new Google users
- ✅ Account linking (if email already exists with password, links Google account)
- ✅ Profile picture and name from Google account
- ✅ Same JWT token system as regular login
- ✅ Works on both Login and Register pages

## Testing

1. Start both server and client
2. Go to `/login` or `/register`
3. Click "Continue with Google"
4. Sign in with Google account
5. Should redirect to dashboard after successful authentication

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the callback URL in `.env` matches exactly with Google Console
- Check for trailing slashes
- Verify protocol (http vs https)

### "Invalid credentials" Error
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in `.env`
- Make sure Google+ API is enabled

### Session Issues
- Ensure SESSION_SECRET is set in `.env`
- Check that express-session is properly configured

## Production Checklist

- [ ] Update GOOGLE_CALLBACK_URL to production URL
- [ ] Add production callback URL to Google Console
- [ ] Update FRONTEND_URL to production domain
- [ ] Use HTTPS in production
- [ ] Set secure session cookies in production


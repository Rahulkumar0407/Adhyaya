import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { generateTokens } from '../middleware/auth.js';

console.log('Passport config loading. GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'FOUND' : 'MISSING');

// Configure Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID) {
    console.log('Registering Google OAuth Strategy...');
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists with this Google ID
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        // User exists, return user
                        return done(null, user);
                    }

                    // Check if user exists with this email (but signed up with password)
                    user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        // Link Google account to existing user
                        user.googleId = profile.id;
                        if (profile.photos && profile.photos[0]) {
                            user.avatar = profile.photos[0].value;
                        }
                        await user.save();
                        return done(null, user);
                    }

                    // Create new user
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName || profile.name?.givenName || 'User',
                        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
                        // Password not required for OAuth users
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
} else {
    console.warn('Google OAuth credentials missing. Skipping Google Strategy initialization.');
}

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;


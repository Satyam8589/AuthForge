import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const userData = {
                        googleId: profile.id,
                        email: profile.emails[0]?.value,
                        name: profile.displayName,
                        picture: profile.photos[0]?.value || null,
                    };
                    
                    return done(null, userData);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
} else {
    console.warn("Google OAuth credentials missing in environment variables. Google OAuth is disabled.");
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;

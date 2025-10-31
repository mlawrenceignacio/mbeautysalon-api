import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false, { message: "No email found." });

        let user = await User.findOne({ email });

        if (!user) {
          const platform = req.query.state;
          const role = platform === "mobile" ? "admin" : "user";

          user = await User.create({
            email,
            password: Math.random().toString(36).slice(2, 12),
            username:
              profile.displayName ||
              `Client${Math.floor(Math.random() * 1000)}`,
            provider: "google",
            role,
          });
        } else {
          const platform = req.query.state;
          const newRole = platform === "mobile" ? "admin" : "user";

          if (newRole !== user.role) {
            user.role = newRole;
            await user.save();
          }
        }

        user._platform = req.query.state;

        return done(null, user);
      } catch (error) {
        console.error("OAuth Error: ", error);
        return done(error, null);
      }
    }
  )
);

export default passport;

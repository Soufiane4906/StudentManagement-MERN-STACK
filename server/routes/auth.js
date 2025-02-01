import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
import { staticUsers } from '../config/staticUsers.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Initialize static users
const initializeStaticUsers = async () => {
  try {
    for (const userData of staticUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Static user created: ${userData.email}`);
      }
    }
  } catch (error) {
    console.error('Error initializing static users:', error);
  }
};

initializeStaticUsers();

// Configure Passport OAuth strategies
// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: '/api/auth/google/callback'
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     let user = await User.findOne({ email: profile.emails[0].value });
//
//     if (!user) {
//       user = new User({
//         email: profile.emails[0].value,
//         password: Math.random().toString(36).slice(-8), // Random password
//         role: 'STUDENT', // OAuth users are always students
//         googleId: profile.id
//       });
//       await user.save();
//     }
//
//     return done(null, user);
//   } catch (error) {
//     return done(error, null);
//   }
// }));

// passport.use(new GitHubStrategy({
//   clientID: process.env.GITHUB_CLIENT_ID,
//   clientSecret: process.env.GITHUB_CLIENT_SECRET,
//   callbackURL: '/api/auth/github/callback'
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     let user = await User.findOne({ email: profile.emails[0].value });
//
//     if (!user) {
//       user = new User({
//         email: profile.emails[0].value,
//         password: Math.random().toString(36).slice(-8), // Random password
//         role: 'STUDENT', // OAuth users are always students
//         githubId: profile.id
//       });
//       await user.save();
//     }
//
//     return done(null, user);
//   } catch (error) {
//     return done(error, null);
//   }
// }));

// Regular email/password login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('email', email);
    const user = await User.findOne({ email });
    console.log('user', user);
    
if (!user || !(await user.comparePassword(password))) {
  console.log('Invalid login credentials');
  throw new Error('Invalid login credentials');
}
    
    const token = jwt.sign({ userId: user._id },  'secret');
console.log('token', token);

    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Register (disabled for static users and OAuth only)
router.post('/register', async (req, res) => {
  res.status(403).json({ message: 'Registration is disabled. Please use OAuth or contact administrator.' });
});

// OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET);
    res.redirect(`/auth/callback?token=${token}`);
  }
);

router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET);
    res.redirect(`/auth/callback?token=${token}`);
  }
);

router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

export default router;
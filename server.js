require('dotenv').config(); // Læs .env filen
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

const app = express();
const PORT = 3001;

// ----- PASSPORT KONFIGURATION -----
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,         // Fra .env
      clientSecret: process.env.DISCORD_CLIENT_SECRET, // Fra .env
      callbackURL: 'http://localhost:3001/auth/discord/callback',
      scope: ['identify', 'email'] // Tilpas scopes efter behov
    },
    function(accessToken, refreshToken, profile, done) {
      // Her kan du gemme profil i database hvis nødvendigt
      return done(null, profile);
    }
  )
);

// ----- MIDDLEWARE -----
app.use(
  session({
    secret: 'nogethemmeligt', // Skift til noget sikkert i produktion
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ----- ROUTES -----

// Starter Discord login
app.get('/auth/discord', passport.authenticate('discord'));

// Discord callback
app.get(
  '/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    // Login succesfuldt
    res.redirect('/dashboard'); // Skift til hvor du vil sende brugeren
  }
);

// Eksempel på dashboard
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/');
  res.send(`Velkommen, ${req.user.username}#${req.user.discriminator}!`);
});

// Hjemmeside
app.get('/', (req, res) => {
  res.send('Velkommen til ZerithRP! <a href="/auth/discord">Login med Discord</a>');
});

// ----- SERVER START -----
app.listen(PORT, () => {
  console.log(`Server kører på http://localhost:${PORT}`);
});
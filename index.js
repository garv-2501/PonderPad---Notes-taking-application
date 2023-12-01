require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const port = process.env.PORT || 3000;

// databasse connection
const connectDB = require("./server/config/database");

// session and passport
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");

// For the notes in the dashboard
const Note = require("./server/models/Note");
const mongoose = require("mongoose");
// User model
const User = require("./server/models/User");

app.use(expressLayouts);
app.set("layout", "./layouts/main-layout");
app.set("view engine", "ejs");

// session
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
);

// check the login status
isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.status(401).send("You must be logged in to view this page");
  }
};

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

// connect to database
connectDB();

// ------------------ ROUTES ------------------ //

// Routes For the Home Page
app.get("/", (req, res) => {
  res.render("./pages/home", {
    page: "home",
    title: "PonderPad - Notes taking application",
    description:
      "PonderPad is an open-source notes taking application with a simple and intuitive design. Sign up for free and start taking notes today!",
  });
});
app.get("/about", (req, res) => {
  res.render("./pages/about", {
    page: "about",
    title: "About PonderPad",
    description:
      "PonderPad is an open-source notes taking application with a simple and intuitive design. Sign up for free and start taking notes today!",
  });
});

// Routes for the Dashboard
app.get("/dashboard", isLoggedIn, (req, res) => {
  res.render("./dashboard/dashboard", {
    layout: "./layouts/dashboard-layout",
    page: "dashboard",
    title: "Dashboard",
    description: "Your dashboard description here...",
  });
});

// ------------------ AUTHENTICATION ------------------ //

var GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            profilePhoto: profile.photos[0].value,
          });
        }
        cb(null, user);
      } catch (err) {
        console.error(err);
        cb(err, null);
      }
    }
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "/dashboard",
  })
);

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.send("Logged out error");
    } else {
      res.redirect("/");
    }
  });
});

// Get data from the user
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(async function (id, cb) {
  try {
    const user = await User.findById(id);
    cb(null, user);
  } catch (err) {
    cb(err, null);
  }
});

// ------------------ 404 ------------------ //
app.use((req, res) => {
  res.status(404).render("./pages/404", {
    page: "404",
    title: "404 - Page Not Found",
    description:
      "PonderPad is an open-source notes taking application with a simple and intuitive design. Sign up for free and start taking notes today!",
  });
});

app.listen(port, () => {
  console.log(
    `Your application "PonderPad" is listening at http://localhost:${port}`
  );
});

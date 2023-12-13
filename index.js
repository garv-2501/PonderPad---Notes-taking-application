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

const methodOverride = require("method-override");

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

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

// method override
app.use(methodOverride("_method"));

// connect to database
connectDB();

// check the login status
isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.status(401).send("You must be logged in to view this page");
  }
};

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

// Routes For the Dashboard
app.get("/dashboard", isLoggedIn, async (req, res, next) => {
  try {
    const notes = await Note.find({
      user: new mongoose.Types.ObjectId(req.user._id),
    }).sort({ createdAt: "desc" });

    res.render("./dashboard/dashboard", {
      layout: "./layouts/dashboard-layout",
      page: "dashboard",
      title: "Dashboard",
      description: "Your dashboard description here...",
      userProfilePhoto: req.user.profilePhoto,
      activePage: "dashboard",
      notes: notes,
      current: 1,
      pages: 1, // Since pagination is not being used
    });
  } catch (err) {
    console.error("Error fetching notes: ", err);
    res.status(500).send("Error fetching notes");
  }
});

// Routes For the Notes (To render the notes)
app.get("/dashboard/edit/:id", isLoggedIn, async (req, res, next) => {
  try {
    const note = await Note.findById({ _id: req.params.id })
      .where({ user: req.user.id })
      .lean();
    if (note) {
      res.render("dashboard/edit-note", {
        layout: "./layouts/dashboard-layout",
        page: "dashboard",
        title: "Edit Note",
        description: "Edit your note here...",
        activePage: "dashboard",
        userProfilePhoto: req.user.profilePhoto,
        noteID: req.params.id,
        note: note,
      });
    }
  } catch (err) {
    console.error("Error fetching note: ", err);
    res.status(500).send("Error fetching note");
  }
});

// Routes For the Notes (To update the notes)
app.put("/dashboard/edit/:id", isLoggedIn, async (req, res, next) => {
  try {
    await Note.findByIdAndUpdate(
      { _id: req.params.id },
      {
        title: req.body.title,
        content: req.body.content,
      }
    ).where({ user: req.user.id });

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error fetching note: ", err);
    res.status(500).send("Error fetching note");
  }
});

// Routes For the Notes (To delete the notes)
app.delete("/dashboard/delete/:id", isLoggedIn, async (req, res, next) => {
  try {
    await Note.deleteOne({ _id: req.params.id }).where({
      user: req.user.id,
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error fetching note: ", err);
    res.status(500).send("Error fetching note");
  }
});

// Routes For the Notes (To create the notes)
app.get("/dashboard/create", isLoggedIn, (req, res) => {
  res.render("dashboard/create-note", {
    layout: "./layouts/dashboard-layout",
    page: "dashboard",
    title: "Create Note",
    description: "Create your note here...",
    activePage: "create",
    userProfilePhoto: req.user.profilePhoto,
  });
});
app.post("/dashboard/create", isLoggedIn, async (req, res) => {
  try {
    await Note.create({
      title: req.body.title,
      content: req.body.content,
      user: req.user.id,
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error creating note: ", err);
    res.status(500).send("Error creating note");
  }
});

// Routes For the Notes (To search the notes)
app.get("/dashboard/search", isLoggedIn, async (req, res) => {
  try {
    res.render("./dashboard/search", {
      layout: "./layouts/dashboard-layout",
      page: "dashboard",
      title: "Dashboard",
      description: "Your dashboard description here...",
      userProfilePhoto: req.user.profilePhoto,
      activePage: "dashboard",
      notes: notes,
      searchResults: [],
    });
  } catch (err) {
    console.error("Error fetching notes: ", err);
    res.status(500).send("Error fetching notes");
  }
});

app.post("/dashboard/search", isLoggedIn, async (req, res) => {
  try {
    const notes = await Note.find({
      user: new mongoose.Types.ObjectId(req.user._id),
      $text: { $search: req.body.q },
    }).sort({ createdAt: "desc" });

    res.render("./dashboard/dashboard", {
      layout: "./layouts/dashboard-layout",
      page: "dashboard",
      title: "Dashboard",
      description: "Your dashboard description here...",
      userProfilePhoto: req.user.profilePhoto,
      activePage: "dashboard",
      notes: notes,
      current: 1,
      pages: 1, // Since pagination is not being used
    });
  } catch (err) {
    console.error("Error fetching notes: ", err);
    res.status(500).send("Error fetching notes");
  }
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

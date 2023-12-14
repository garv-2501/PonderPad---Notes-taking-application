// Load environment variables from .env file
require("dotenv").config();

// Import required modules
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const https = require("https");

// Import database configuration and models
const connectDB = require("./server/config/database");
const Note = require("./server/models/Note");
const User = require("./server/models/User");

// Initialize Express application
const app = express();
const port = process.env.PORT || 3000;

// Apply EJS layouts and set view engine
app.use(expressLayouts);
app.set("layout", "./layouts/main-layout");
app.set("view engine", "ejs");

// Configure session with MongoDB store
app.use(
  session({
    secret: "keyboard cat", // Secret for session encryption (should be in .env)
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // MongoDB URI for session store
    }),
  })
);

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Enable parsing of request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Enable HTTP method override for forms
app.use(methodOverride("_method"));

// Connect to the database
connectDB();

// Middleware to check login status
isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.status(401).send("You must be logged in to view this page");
  }
};

// ----------------------------------------------------------- //
// ------------------------- ROUTES -------------------------- //
// ----------------------------------------------------------- //

// Route for Home Page
app.get("/", (req, res) => {
  // Render home page with specific layout and data
  res.render("./pages/home", {
    page: "home",
    title: "PonderPad - Notes taking application",
    description:
      "PonderPad is an open-source notes taking application with a simple and intuitive design. Sign up for free and start taking notes today!",
  });
});

// Route for About Page
app.get("/about", async (req, res) => {
  // Fetch a quote from an external API for the about page
  const category = "happiness"; // or any other category you prefer
  const apiKey = process.env.QUOTEAPI; // Load API key from .env file

  try {
    const response = await fetch(
      `https://api.api-ninjas.com/v1/quotes?category=${category}`,
      {
        headers: {
          "X-Api-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch quote");
    }

    const quoteData = await response.json();
    // Render about page with quote data
    res.render("./pages/about", {
      page: "about",
      title: "About PonderPad",
      description:
        "PonderPad is an open-source notes taking application with a simple and intuitive design. Sign up for free and start taking notes today!",
      quote: quoteData[0], // Send the first quote to the template
    });
  } catch (error) {
    console.error("Error fetching quote:", error);
    // Render the page without a quote in case of an error
    res.render("./pages/about", {
      page: "about",
      title: "About PonderPad",
      description:
        "PonderPad is an open-source notes taking application with a simple and intuitive design. Sign up for free and start taking notes today!",
      quote: null,
    });
  }
});

// API Route to push out all quotes
app.get("/api/quotes", (req, res) => {
  const keyword = req.query.keyword || "happiness"; // Default to 'happiness' if no keyword is provided
  const apiKey = process.env.QUOTEAPI; // Load API key from .env file
  const url = `https://api.api-ninjas.com/v1/quotes?category=${keyword}`;

  https
    .get(
      url,
      {
        headers: {
          "X-Api-Key": apiKey,
        },
      },
      (response) => {
        let data = "";

        // A chunk of data has been received.
        response.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        response.on("end", () => {
          try {
            const quotes = JSON.parse(data);
            res.json(quotes);
          } catch (error) {
            console.error("Error parsing response:", error);
            res.status(500).json({ error: "Error fetching quotes" });
          }
        });
      }
    )
    .on("error", (error) => {
      console.error("Error making HTTP request:", error);
      res.status(500).json({ error: "Error fetching quotes" });
    });
});

// Routes for Dashboard
app.get("/dashboard", isLoggedIn, async (req, res, next) => {
  // Fetch notes for the logged-in user and display them on the dashboard
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

// Route to Edit a Note
app.get("/dashboard/edit/:id", isLoggedIn, async (req, res, next) => {
  // Fetch a specific note for editing
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

// Route to Update a Note
app.put("/dashboard/edit/:id", isLoggedIn, async (req, res, next) => {
  // Handle note update logic
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
    console.error("Error updating note: ", err);
    res.status(500).send("Error updating note");
  }
});

// Route to Delete a Note
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

// Route to Create a Note
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

// Route to Search for a Note
app.get("/dashboard/search", isLoggedIn, async (req, res) => {
  try {
    res.render("./dashboard/search", {
      layout: "./layouts/dashboard-layout",
      page: "dashboard",
      title: "Dashboard",
      description: "Your dashboard description here...",
      userProfilePhoto: req.user.profilePhoto,
      activePage: "dashboard",
      searchResults: "",
    });
  } catch (err) {
    console.error("Error fetching notes: ", err);
    res.status(500).send("Error fetching notes");
  }
});

// Route to Search for a Note (POST)
app.post("/dashboard/search", isLoggedIn, async (req, res) => {
  try {
    let searchInput = req.body.searchInput;
    const searchNoSpecialChars = searchInput.replace(/[^a-zA-Z0-9 ]/g, "");

    const searchResults = await Note.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChars, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChars, "i") } },
      ],
    }).where({ user: req.user.id });

    res.render("./dashboard/search", {
      layout: "./layouts/dashboard-layout",
      page: "dashboard",
      title: "Dashboard",
      description: "Your dashboard description here...",
      userProfilePhoto: req.user.profilePhoto,
      activePage: "dashboard",
      searchResults: searchResults,
    });
  } catch (err) {
    console.error("Error fetching notes: ", err);
    res.status(500).send("Error fetching notes");
  }
});

// ----------------------------------------------------------- //
// ---------------------- AUTHENTICATION --------------------- //
// ----------------------------------------------------------- //

// Import Google OAuth2.0 Strategy from passport-google-oauth20
var GoogleStrategy = require("passport-google-oauth20").Strategy;

// Configuring Passport to use Google OAuth 2.0
passport.use(
  new GoogleStrategy(
    {
      // Configuration with Google Client ID, Secret, and Callback URL from .env
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, cb) => {
      // Callback function to handle user profile after authentication
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // Create a new user if not found in the database
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

// Route for initiating Google Authentication
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// Route for Google OAuth callback
app.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/", // Redirect to home page on failure
    successRedirect: "/dashboard", // Redirect to dashboard on success
  })
);

// Route for Logout
app.get("/logout", (req, res) => {
  // Destroying session to log out user
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.send("Logged out error");
    } else {
      res.redirect("/");
    }
  });
});

// Serialize user ID to save in the session
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

// Deserialize user from session ID to user object
passport.deserializeUser(async function (id, cb) {
  try {
    const user = await User.findById(id);
    cb(null, user);
  } catch (err) {
    cb(err, null);
  }
});

// ----------------------------------------------------------- //
// ----------------------- 404 ERROR ------------------------- //
// ----------------------------------------------------------- //
// Catch-all route for handling 404 (Page Not Found) errors
app.use((req, res) => {
  res.status(404).render("./pages/404", {
    page: "404",
    title: "404 - Page Not Found",
    description:
      "PonderPad is an open-source notes taking application with a simple and intuitive design. Sign up for free and start taking notes today!",
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(
    `Your application "PonderPad" is listening at http://localhost:${port}`
  );
});

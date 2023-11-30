require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const port = process.env.PORT || 3000;

app.use(expressLayouts);
app.set("layout", "./layouts/main-layout");
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.render("home", {
    page: "home",
    title: "PonderPad - Notes taking application",
    description:
      "PonderPad is an open-source notes taking application with a simple and intuitive design. Sign up for free and start taking notes today!",
  });
});
app.get("/about", (req, res) => {
  res.render("about", {
    page: "about",
    title: "About PonderPad",
    description:
      "PonderPad is an open-source notes taking application with a simple and intuitive design. Sign up for free and start taking notes today!",
  });
});

app.listen(port, () => {
  console.log(
    `Your application "PonderPad" is listening at http://localhost:${port}`
  );
});

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Creating a new schema for the User model
const UserSchema = new Schema({
  // Field for storing Google ID, required for each user
  googleId: {
    type: String,
    required: true,
  },
  // Field for storing the user's display name
  displayName: {
    type: String,
    required: true,
  },
  // Field for storing the user's first name
  firstName: {
    type: String,
  },
  // Field for storing the user's last name
  lastName: {
    type: String,
  },
  // Field for storing the URL of the user's profile photo
  profilePhoto: {
    type: String,
  },
  // Field to store the date when the user was created
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets to the current date and time
  },
});

// Compiling our schema into a Model
const User = mongoose.model("User", UserSchema);

// Exporting
module.exports = User;

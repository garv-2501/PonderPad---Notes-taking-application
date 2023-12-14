const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Defining a new schema for the Note document
const NoteSchema = new Schema({
  // 'user' field to associate the note with a user (reference to User model)
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  // 'title' field to store the title of the note, which is required
  title: {
    type: String,
    required: true,
  },
  // 'content' field to store the main content of the note
  content: {
    type: String,
  },
  // 'tags' field to store an array of tags for categorization
  tags: {
    type: Array,
  },
  // 'createdAt' field to store the date when the note was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compiling the schema into a Model to interact with the 'notes' collection in the database
const Note = mongoose.model("Note", NoteSchema);

// Export
module.exports = Note;

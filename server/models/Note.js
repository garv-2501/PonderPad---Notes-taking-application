const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NoteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  tags: {
    type: Array,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Note = mongoose.model("Note", NoteSchema);

module.exports = Note;

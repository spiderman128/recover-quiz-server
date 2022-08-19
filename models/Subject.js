const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubjectSchema = mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
});

module.exports = Subject = mongoose.model('Subject', SubjectSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = mongoose.Schema({
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'Subject'
  },
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
    default: false
  }
});

module.exports = Question = mongoose.model('Question', QuestionSchema);
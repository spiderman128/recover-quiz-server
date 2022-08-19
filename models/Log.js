const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LogSchema = mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  details: [
    {
      question: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      answer: {
        type: Boolean,
        default: false,
      },
    },
  ],
  mark: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Log = mongoose.model("Log", LogSchema);
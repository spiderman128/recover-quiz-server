const express = require("express");
const router = express.Router();
const passport = require('passport');
const _ = require("lodash");
const sgMail = require("@sendgrid/mail");

const Log = require("../models/Log");
const Subject = require("../models/Subject");
const User = require("../models/User");
const Question = require("../models/Question");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get("/", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const questions = await Question.find(
    { isDeleted: false },
    "subject text"
  ).populate("subject", "text");
  res.status(200).json(questions);
});

router.get("/logs", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const logs = await Log.find({}, "user mark date")
    .populate("user", "name lastname email phonenumber")
    .sort("-date");
  res.status(200).json(logs);
});

router.post("/mark", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const answers = req.body;

  let subjects = await Subject.find({ isDeleted: false });
  subjects = subjects.map((item) => ({
    _id: item._id,
    text: item.text,
    weight: item.weight,
    mark: 0,
    answers: [],
  }));

  let answer,
    question,
    subject,
    mark = 0;
  for (var i = 0; i < answers.length; i++) {
    answer = answers[i];
    question = await Question.findById(answer.question);
    subject = subjects.find(
      (item) => item._id.toString() === question.subject.toString()
    );
    if (answer.answer) subject.mark += 100 * question.weight;
    subject.answers.push({
      text: question.text,
      answer: answer.answer,
    });
  }

  mark = subjects.reduce(
    (total, value) => total + value.mark * value.weight,
    0
  );

  mark = mark.toFixed(2);

  let tmpString = "";
  emailString = subjects
    .map((item) => {
      tmpString = `<h5>${item.text} : ${item.mark}</h5>`;
      tmpString +=
        "<div style='padding-left:20px;'>" +
        item.answers
          .map(
            (item2) => `<p>${item2.answer ? "<span style='color: #52c41a'>✔</span>" : "<span style='color: #fd4c75'>✘</span>"}&nbsp;&nbsp;&nbsp;&nbsp;${item2.text}</p>`
          )
          .join("") +
        "</div>";
      return tmpString;
    })
    .join("");

  await new Log({
    user: req.user._id,
    details: answers,
    mark: mark,
    date: new Date(),
  }).save();

  const oldAdmin = await User.findOne({ role: 1 });

  const msg = {
    to: oldAdmin.email, // Change to your recipient
    from: "support@geniusrei.eu", // Change to your verified sender
    subject: "Test compilato da " + req.user.name + " " + req.user.lastname,
    html: `<div>
      <h4> Nome: &nbsp;&nbsp;&nbsp;${req.user.name}  </h4>  
      <h4> Email: &nbsp;&nbsp;&nbsp;${req.user.email} </h4>
      <h4> Punteggio: &nbsp;&nbsp;&nbsp;${mark} </h4>
      ${emailString}
    </div>`,
  };

  sgMail
    .send(msg)
    .then((response) => {
      res.status(200).json({ subjects, mark, sendmail: true });
    })
    .catch((error) => {
      res.status(200).json({ subjects, mark, sendmail: false });
    });
});

module.exports = router;

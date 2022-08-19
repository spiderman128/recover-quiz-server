const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require('passport');

const User = require("../models/User");
const keys = require('../config/key');

//=================================
//             User
//=================================

router.get("/auth", passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    phonenumber: req.user.phonenumber,
    role: req.user.role,
    image: req.user.image,
  });
});

router.post("/register", async (req, res) => {
  const userCount = await User.find().count();

  // Set the first user as an administrator
  const user = new User({
    ...req.body,
    role: userCount === 0 ? 1 : 0,
  });

  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: "Auth failed, email not found",
      });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "Wrong password" });

      // User Matched
      const payload = { id: user._id, name: user.name }; // Create JWT Payload

      // Sign Token
      jwt.sign(
        payload,
        keys.secretOrKey,
        { expiresIn: 3600 },
        (err, token) => {
          res.json({
            loginSuccess: true,
            userId: user._id,
            token: 'Bearer ' + token,
          });
        }
      );
    });
  });
});

router.get("/logout", passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    { token: "", tokenExp: "" },
    (err, doc) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true,
      });
    }
  );
});

module.exports = router;
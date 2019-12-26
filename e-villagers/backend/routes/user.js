const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require('../model/user');


router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10, (err,hash) => {
    console.log(hash);
    const user = new User({
      email: req.body.email,
      password: hash
    });

    user.save()
      .then(result => {
        res.status(201).json({
          message: "User Created!",
          result: result
        });
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  });
});

router.post("/login", (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: "Authentication failed! Email not found."
        });
      }
      fetchedUser = user;
      console.log("fetched user " + user.password);
      console.log('request pass '+ req.body.password);
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: "Authentication failed!"
        });
      }

      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        "secret_key_that_is_long_just_for_development_",
        { expiresIn: '1h'}
      );

      res.status(200).json({
        token: token
      })
    })
    .catch(err => {
      return res.status(401).json({
        message: "Authentication failed!!",
        error: err
      });
    });
});


module.exports = router;

"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const passport = require("passport");
const session = require("express-session");

const app = express();

app.set('view engine', 'pug')

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.route("/").get((req, res) => {
  res.render(process.cwd() + '/views/pug/index', {title: 'Hello', message: 'Please login'})
  //Change the response to render the Pug template
});


app.use(session({
  secret: "lkdjal3",
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});

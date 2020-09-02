"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const passport = require("passport");
const session = require("express-session");
const ObjectID = require("mongodb");
const mongo = require('mongodb').MongoClient;
const dotenv = require("dotenv").config()
const LocalStrategy = require('passport-local');
const bodyParser = require("body-parser");
const { response, request } = require("express");


const app = express();

app.set('view engine', 'pug')

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));





app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));



mongo.connect(process.env.DATABASE, (err, client) => {
  if(err) {
    console.log('Database error: ' + err);
  } else {
    let db = client.db("mongonpm")
    console.log('Successful database connection');

    //serialization and app.listen
    app.route("/").get((req, res) => {
      res.render(process.cwd() + '/views/pug/index', {title: 'Hello', message: 'Please login', showLogin: true})
      //Change the response to render the Pug template
    });
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });
    passport.deserializeUser((id, done) => {
      db.collection('users').findOne(
        {_id: new ObjectID(id)},
          (err, doc) => {
            done(null, doc);
          }
      );
    });
    let findUserDocument = new LocalStrategy(
      function(username, password, done) {
        db.collection('users').findOne({ username: username }, function (err, user) {
          console.log('User '+ username +' attempted to log in.');
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (password !== user.password) { return done(null, false); }
          return done(null, user);
        });
      }
    );

    passport.use(findUserDocument)

    app.post('/login',
      bodyParser.urlencoded({ extended: false}),
      passport.authenticate('local', {failureRedirect: '/'}),
      (request, response) => {
        response.redirect('/profile')
      }
    )

      app.get('/profile', (request, response) => {
        response.render('/views/pug/profile')
      })

  }
});

app.use(passport.initialize());
app.use(passport.session());

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});

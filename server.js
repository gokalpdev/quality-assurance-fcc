"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const passport = require("passport");
const session = require("express-session");
const ObjectID = require("mongodb").ObjectID;;
const mongo = require('mongodb').MongoClient;
const LocalStrategy = require('passport-local');
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config()


const app = express();

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug')

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());


mongo.connect(process.env.DATABASE, (err, client) => {
  if(err) {
    console.log('Database error: ' + err);
  } else {
    let db = client.db("mongonpm")
    console.log('Successful database connection');

    //serialization and app.listen

    passport.use(new LocalStrategy(
      (username, password, done) => {
        db.collection('users').findOne({ username: username }, (err, user)=> {
          console.log('User '+ username +' attempted to log in.');
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (password !== user.password) { return done(null, false); }
          return done(null, user);
        });
      }
    ));

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

    app.post('/login', 
      passport.authenticate('local',  {failureRedirect: '/' }), 
      (req, res) => {
        res.redirect('/profile')
    })

    app.get('/profile', (req, res)=>{
      res.render(process.cwd() + '/views/pug/profile')
    })

    app.route("/")
      .get((req, res) => {
        res.render(process.cwd() + '/views/pug/index', {title: 'Hello', message: 'Please login', showLogin: true, showRegistration: true})
      //Change the response to render the Pug template
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });

}});




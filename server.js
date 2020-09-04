"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const passport = require("passport");
const session = require("express-session");
const mongo = require('mongodb').MongoClient;
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config()
const routes = require('./routes.js');
const auth = require('./auth.js');
const app = express();

fccTesting(app); //For FCC testing purposes

app.set('view engine', 'pug')
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
    let db = client.db("fcc-node")
    console.log('Successful database connection');

    //serialization and app.listen

    routes(app, db);
    auth(app, db);

    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });

}});




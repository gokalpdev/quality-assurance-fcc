const bcrypt = require("bcrypt")
const passport = require("passport");

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
};

module.exports = function (app, db) {

    app.route("/")
    .get((req, res) => {
      res.render(process.cwd() + '/views/pug/index', {title: 'Home Page', message: 'Please login', showLogin: true, showRegistration: true})
    //Change the response to render the Pug template
    });

    app.route('/register')
    .post((req, res, next) => {
      db.collection('users').findOne({ username: req.body.username }, function(err, user) {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect('/');
        } else {
          const hash = bcrypt.hashSync(req.body.password, 12);
          db.collection('users').insertOne({
            username: req.body.username,
            password: hash
          },
            (err, doc) => {
              if (err) {
                res.redirect('/');
              } else {
                next(null, user);
              }
            }
          )
        }
      })
    },
      passport.authenticate('local', { failureRedirect: '/' }),
      (req, res, next) => {
        res.redirect('/profile');
      }
    );

    app.route('/login')
    .post(passport.authenticate('local', { failureRedirect: '/' }),(req,res) => {
        res.redirect('/profile');
    });

    app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });

    app.route('/profile')
    .get( ensureAuthenticated, (req,res) => {
        res.render(process.cwd() + '/views/pug/profile', {username: req.user.username});
    });

    app.use((req, res, next) => {
        res.status(404)
          .type('text')
          .send('Not Found');
    });
}
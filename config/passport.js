'use strict'
const LocalStrategy = require('passport-local').Strategy
const User = require('../app/models/user')

module.exports = function (passport) {
  // passport session setup
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user))
  })
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'
  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
    function (req, email, password, done) {
      console.log(email, password)
        // asynchronous
        // User.findOne wont fire unless data is sent back
      process.nextTick(function () {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email': email }, (err, user) => {
            // if there are any errors, return the error
          if (err) return done(err)
            // check to see if theres already a user with that email
          console.log('user:', user)
          if (user) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'))
          } else {
            // if there is no user with that email
            // create the user
            const newUser = new User()
            // set the user's local credentials
            newUser.local.email = email
            newUser.local.password = newUser.generateHash(password)
            // save the user
            newUser.save(function (err) {
              if (err) throw err
              return done(null, newUser)
            })
          }
        })
      })
    }))
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
    function (req, email, password, done) { // callback with email and password from our form
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ 'local.email': email }, (err, user) => {
        // if there are any errors, return the error before anything else
        if (err) return done(err)
        // if no user is found, return the message
        // req.flash is the way to set flashdata using connect-flash
        if (!user) { return done(null, false, req.flash('loginMessage', 'No user found.')) } 
        // if the user is found but the password is wrong
        // create the loginMessage and save it to session as flashdata
        if (!user.validPassword(password)) { return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')) } 
        // all is well, return successful user
        return done(null, user)
      })
    }))
}

'use strict'
const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')

// define the schema for our user model
const User = mongoose.Schema({
  local: {
    email: String,
    password: String
  }
})

// methods
// generating a hash
User.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

// checking if password is valid
User.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.local.password)
}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', User)
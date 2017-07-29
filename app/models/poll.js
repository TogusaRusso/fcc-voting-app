'use strict'
const mongoose = require('mongoose')

const Poll = mongoose.Schema({
  question: String,
  createdBy: String,
  options: [{
    text: String,
    votes: Number
  }]
})

module.exports = mongoose.model('Poll', Poll)

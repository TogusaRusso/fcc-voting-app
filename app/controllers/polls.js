'use strict'
const Poll = require('../models/poll')

module.exports = {
  all(done) {
    Poll.find({}, done)
  },
  newPoll(poll, done) {
    let newPoll = new Poll()
    newPoll.question = poll.question
    newPoll.options = poll.options
    newPoll.createdBy = poll.createdBy
    newPoll.save(done)
  },
  byId(id, done) {
    Poll.findById(id, done)
  },
  byUser(email, done) {
    Poll.find({createdBy: email}, done)
  },
  deleteById(id, done) {
    Poll.deleteOne({_id: id}, done)
  },
  update(poll, done) {
    Poll.findOneAndUpdate({_id: poll._id}, poll, done)
  }
}
